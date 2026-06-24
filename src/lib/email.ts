import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "causeClub <hello@paritygolf.com>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    return { success: true, mock: true };
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email send failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}
