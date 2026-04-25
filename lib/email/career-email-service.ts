// (removed unused CareerApplication import)
// Map application stage to email template type
export const STAGE_TO_EMAIL_TEMPLATE: Partial<Record<string, CareerEmailTemplateType>> = {
  shortlisted: "shortlisted",
  assessment: "assessment",
  interview: "interview",
  offer: "offer",
  hired: "hired",
  rejected: "rejected",
};

/**
 * Returns the email template type for a given stage, or undefined if none.
 */
export function getEmailTemplateForStage(stage: string): CareerEmailTemplateType | undefined {
  return STAGE_TO_EMAIL_TEMPLATE[stage];
}
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
