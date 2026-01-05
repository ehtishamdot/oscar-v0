/**
 * @fileoverview Server action to send an email.
 * This is a placeholder for a real email sending service like Resend, SendGrid, or Nodemailer.
 */
// 'use server'; // Disabled for static export

import { z } from 'zod';

// Define the input schema for the server action.
const SendEmailInputSchema = z.object({
  to: z.string().email("Ongeldig e-mailadres"),
  subject: z.string(),
  body: z.string(),
});

export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

/**
 * Sends an email.
 * NOTE: This is a simulation. In a real-world scenario, you would integrate
 * a service like Resend, SendGrid, or Nodemailer here.
 */
export async function sendEmailFlow(input: SendEmailInput): Promise<{ success: boolean; message: string }> {
  const validatedInput = SendEmailInputSchema.parse(input);

  console.log("--- E-MAIL VERZENDEN (SIMULATIE) ---");
  console.log(`Aan: ${validatedInput.to}`);
  console.log(`Onderwerp: ${validatedInput.subject}`);
  console.log("--- Inhoud --- \n", validatedInput.body);
  console.log("-----------------------------------------");

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, you would have error handling based on the email service response
  if (validatedInput.to === "o.e.c.vanmaarseveen@outlook.com") {
      console.log("Test e-mail succesvol verzonden naar het opgegeven testadres.");
      return { success: true, message: "E-mail succesvol verzonden!" };
  } else {
      console.warn("LET OP: E-mail niet verzonden naar een echt adres in deze simulatie.");
      return { success: false, message: "Kon e-mail niet verzenden in testmodus." };
  }
}
