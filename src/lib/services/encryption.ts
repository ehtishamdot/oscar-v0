import { KeyManagementServiceClient } from '@google-cloud/kms';
import crypto from 'crypto';

// Lazy-load KMS client to avoid initialization issues during build
let kmsClient: KeyManagementServiceClient | null = null;

function getKmsClient(): KeyManagementServiceClient {
  if (!kmsClient) {
    kmsClient = new KeyManagementServiceClient();
  }
  return kmsClient;
}

function getKmsKeyPath(): string {
  return `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/${process.env.KMS_LOCATION}/keyRings/${process.env.KMS_KEYRING}/cryptoKeys/${process.env.KMS_KEY_NAME}`;
}

export interface EncryptionResult {
  ciphertext: string;       // Base64-encoded encrypted data
  encryptedDataKey: string; // Base64-encoded KEK-encrypted DEK
  iv: string;               // Base64-encoded initialization vector
  authTag: string;          // Base64-encoded authentication tag
}

export interface DecryptionInput {
  ciphertext: string;
  encryptedDataKey: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt a payload using envelope encryption:
 * 1. Generate a random Data Encryption Key (DEK)
 * 2. Encrypt the payload with DEK using AES-256-GCM
 * 3. Encrypt the DEK with Cloud KMS Key Encryption Key (KEK)
 *
 * This ensures the encryption key never leaves Cloud KMS (HSM-backed)
 */
export async function encryptPayload(plaintext: string): Promise<EncryptionResult> {
  // 1. Generate random DEK (256 bits = 32 bytes)
  const dek = crypto.randomBytes(32);

  // 2. Generate random IV (96 bits = 12 bytes, recommended for GCM)
  const iv = crypto.randomBytes(12);

  // 3. Encrypt plaintext with AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // 4. Encrypt DEK with Cloud KMS
  const client = getKmsClient();
  const [encryptResponse] = await client.encrypt({
    name: getKmsKeyPath(),
    plaintext: dek,
  });

  // 5. Return all components
  return {
    ciphertext: ciphertext,
    encryptedDataKey: Buffer.from(encryptResponse.ciphertext as Uint8Array).toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypt a payload:
 * 1. Decrypt the DEK using Cloud KMS
 * 2. Decrypt the ciphertext using the DEK
 *
 * The actual encryption key is decrypted inside Cloud KMS (HSM-backed)
 * and returned securely - it never leaves Google's infrastructure unencrypted
 */
export async function decryptPayload(input: DecryptionInput): Promise<string> {
  // 1. Decrypt DEK with Cloud KMS
  const client = getKmsClient();
  const [decryptResponse] = await client.decrypt({
    name: getKmsKeyPath(),
    ciphertext: Buffer.from(input.encryptedDataKey, 'base64'),
  });

  const dek = Buffer.from(decryptResponse.plaintext as Uint8Array);

  // 2. Decrypt ciphertext with AES-256-GCM
  const iv = Buffer.from(input.iv, 'base64');
  const authTag = Buffer.from(input.authTag, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(input.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * For development/testing without Cloud KMS:
 * Uses a local key derived from an environment variable
 * WARNING: Only use in development, not production!
 */
export async function encryptPayloadLocal(plaintext: string): Promise<EncryptionResult> {
  // Use a fixed key for development (NOT for production!)
  const devKey = process.env.DEV_ENCRYPTION_KEY || 'oscar-dev-key-32-bytes-exactly!';
  const dek = crypto.createHash('sha256').update(devKey).digest();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext,
    encryptedDataKey: 'local-dev-mode', // Marker for local mode
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export async function decryptPayloadLocal(input: DecryptionInput): Promise<string> {
  const devKey = process.env.DEV_ENCRYPTION_KEY || 'oscar-dev-key-32-bytes-exactly!';
  const dek = crypto.createHash('sha256').update(devKey).digest();

  const iv = Buffer.from(input.iv, 'base64');
  const authTag = Buffer.from(input.authTag, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(input.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Auto-select encryption method based on environment
 */
export async function encrypt(plaintext: string): Promise<EncryptionResult> {
  if (process.env.NODE_ENV === 'development' || !process.env.KMS_KEY_NAME) {
    return encryptPayloadLocal(plaintext);
  }
  return encryptPayload(plaintext);
}

export async function decrypt(input: DecryptionInput): Promise<string> {
  if (input.encryptedDataKey === 'local-dev-mode') {
    return decryptPayloadLocal(input);
  }
  return decryptPayload(input);
}
