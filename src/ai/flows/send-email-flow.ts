/**
 * @fileoverview Server action to send an email using SendGrid.
 */

import { z } from 'zod';
import { sendEmail } from '@/lib/services/email';

// Define the input schema for the server action.
const SendEmailInputSchema = z.object({
  to: z.string().email("Ongeldig e-mailadres"),
  subject: z.string(),
  body: z.string(),
});

export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

/**
 * Sends an email using SendGrid.
 */
export async function sendEmailFlow(input: SendEmailInput): Promise<{ success: boolean; message: string }> {
  const validatedInput = SendEmailInputSchema.parse(input);

  console.log("--- E-MAIL VERZENDEN ---");
  console.log(`Aan: ${validatedInput.to}`);
  console.log(`Onderwerp: ${validatedInput.subject}`);
  console.log("-----------------------------------------");

  return sendEmail({
    to: validatedInput.to,
    subject: validatedInput.subject,
    body: validatedInput.body,
  });
}
