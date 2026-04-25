import { smtpTransport } from "./smtp-client";
import { careerEmailTemplates, CareerEmailTemplateType } from "./career-email-templates";

interface SendCareerEmailParams {
  to: string;
  type: CareerEmailTemplateType;
  candidateName: string;
  jobTitle?: string;
  replyTo?: string;
  sentBy: string;
}

export async function sendCareerEmail({
  to,
  type,
  candidateName,
  jobTitle,
  replyTo,
  sentBy,
}: SendCareerEmailParams) {
  const template = careerEmailTemplates[type];
  if (!template) throw new Error("Invalid email template type");

  const fromName = process.env.ZOHO_SMTP_FROM_NAME || "KNYTRA NOTIFICATIONS";
  const fromEmail = process.env.ZOHO_SMTP_FROM_EMAIL || "noreply@knytra.com";
  const replyToEmail = replyTo || process.env.CAREERS_REPLY_TO || fromEmail;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: template.subject,
    html: template.html({ candidateName, jobTitle }),
    replyTo: replyToEmail,
  };

  const result = await smtpTransport.sendMail(mailOptions);

  return {
    type,
    to,
    subject: template.subject,
    sentAt: new Date().toISOString(),
    sentBy,
    provider: "zoho-smtp",
    success: !!result.accepted?.length,
  };
}
