/**
 * SendSMSGate SMS Service
 * API Documentation: https://sendsmsgate.com/en/http-sms-api.php
 */

const SMS_API_URL = 'https://cloud.sendsmsgate.com/sendsms.php';

export interface SMSConfig {
  user: string;
  password: string;
  sender: string;
}

export interface SendSMSParams {
  to: string | string[];
  message: string;
  sender?: string;
}

export interface SMSResponse {
  success: boolean;
  messageIds?: string[];
  error?: string;
  rawResponse?: string;
}

export interface BalanceResponse {
  success: boolean;
  balance?: string;
  currency?: string;
  pricing?: Record<string, string>;
  error?: string;
}

/**
 * Format phone number to E.164 standard (no +, no 00, no spaces)
 * Example: +31 6 12345678 -> 31612345678
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let formatted = phone.replace(/\D/g, '');

  // Remove leading 00 if present
  if (formatted.startsWith('00')) {
    formatted = formatted.substring(2);
  }

  return formatted;
}

/**
 * Get SMS configuration from environment variables
 */
function getConfig(): SMSConfig {
  const user = process.env.SENDSMSGATE_USER;
  const password = process.env.SENDSMSGATE_PASSWORD;
  const sender = process.env.SENDSMSGATE_SENDER || 'Oscar';

  if (!user || !password) {
    throw new Error('SMS credentials not configured. Set SENDSMSGATE_USER and SENDSMSGATE_PASSWORD environment variables.');
  }

  return { user, password, sender };
}

/**
 * Send SMS to one or more recipients
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResponse> {
  try {
    const config = getConfig();

    // Format phone numbers
    const recipients = Array.isArray(params.to)
      ? params.to.map(formatPhoneNumber).join(',')
      : formatPhoneNumber(params.to);

    // Build URL with query parameters
    const url = new URL(SMS_API_URL);
    url.searchParams.set('user', config.user);
    url.searchParams.set('pwd', config.password);
    url.searchParams.set('sadr', params.sender || config.sender);
    url.searchParams.set('dadr', recipients);
    url.searchParams.set('text', params.message);

    const response = await fetch(url.toString());
    const text = await response.text();

    // Check if response contains error
    if (text.toLowerCase().includes('error') || text.startsWith('-')) {
      return {
        success: false,
        error: text,
        rawResponse: text,
      };
    }

    // Parse message IDs from successful response
    const messageIds = text.split(',').map((id) => id.trim());

    return {
      success: true,
      messageIds,
      rawResponse: text,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get account balance and pricing information
 */
export async function getBalance(): Promise<BalanceResponse> {
  try {
    const config = getConfig();

    const url = new URL(SMS_API_URL);
    url.searchParams.set('user', config.user);
    url.searchParams.set('pwd', config.password);
    url.searchParams.set('balance', '1');

    const response = await fetch(url.toString());
    const text = await response.text();

    // Parse response format: "1000 EUR UK:4600,Germany:3700,Netherlands:300"
    const parts = text.split(' ');
    if (parts.length >= 2) {
      const balance = parts[0];
      const currency = parts[1];
      const pricing: Record<string, string> = {};

      if (parts.length > 2) {
        const pricingParts = parts.slice(2).join(' ').split(',');
        for (const part of pricingParts) {
          const [country, count] = part.split(':');
          if (country && count) {
            pricing[country.trim()] = count.trim();
          }
        }
      }

      return {
        success: true,
        balance,
        currency,
        pricing,
      };
    }

    return {
      success: false,
      error: 'Invalid response format',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send verification code SMS
 */
export async function sendVerificationCode(
  phoneNumber: string,
  code: string
): Promise<SMSResponse> {
  const message = `Uw verificatiecode voor Oscar is: ${code}. Deze code is 10 minuten geldig.`;
  return sendSMS({ to: phoneNumber, message });
}

/**
 * Send appointment confirmation SMS
 */
export async function sendAppointmentConfirmation(
  phoneNumber: string,
  patientName: string,
  providerName: string,
  dateTime: string
): Promise<SMSResponse> {
  const message = `Beste ${patientName}, uw afspraak met ${providerName} is bevestigd voor ${dateTime}. Oscar ArtroseZorg`;
  return sendSMS({ to: phoneNumber, message });
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminder(
  phoneNumber: string,
  patientName: string,
  providerName: string,
  dateTime: string
): Promise<SMSResponse> {
  const message = `Herinnering: Beste ${patientName}, u heeft morgen een afspraak met ${providerName} om ${dateTime}. Oscar ArtroseZorg`;
  return sendSMS({ to: phoneNumber, message });
}
