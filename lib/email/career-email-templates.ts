export type CareerEmailTemplateType =
  | "application_received"
  | "shortlisted"
  | "assessment"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

interface CareerEmailTemplate {
  subject: string;
  html: (params: { candidateName: string; jobTitle?: string }) => string;
}

export const careerEmailTemplates: Record<CareerEmailTemplateType, CareerEmailTemplate> = {
  application_received: {
    subject: "Your application has been received",
    html: ({ candidateName, jobTitle }) => `<p>Dear ${candidateName},</p><p>Thank you for applying${jobTitle ? ` for the position of ${jobTitle}` : ""} at Knytra. We have received your application and will review it soon.</p>`
  },
  shortlisted: {
    subject: "You have been shortlisted",
    html: ({ candidateName, jobTitle }) => `<p>Dear ${candidateName},</p><p>Congratulations! You have been shortlisted${jobTitle ? ` for the position of ${jobTitle}` : ""} at Knytra. We will contact you with next steps.</p>`
  },
  assessment: {
    subject: "Assessment Round",
    html: ({ candidateName, jobTitle }) => `<p>Dear ${candidateName},</p><p>You have been selected for the assessment round${jobTitle ? ` for the position of ${jobTitle}` : ""} at Knytra. Please check your dashboard for details.</p>`
  },
  interview: {
    subject: "Interview Invitation",
    html: ({ candidateName, jobTitle }) => `<p>Dear ${candidateName},</p><p>You are invited for an interview${jobTitle ? ` for the position of ${jobTitle}` : ""} at Knytra. We will reach out to schedule a time.</p>`
  },
  offer: {
    subject: "Offer from Knytra",
    html: ({ candidateName, jobTitle }) => `<p>Dear ${candidateName},</p><p>We are pleased to offer you${jobTitle ? ` the position of ${jobTitle}` : " a role"} at Knytra. Please check your dashboard for your offer letter.</p>`
  },
  hired: {
    subject: "Welcome to Knytra!",
    html: ({ candidateName }) => `<p>Dear ${candidateName},</p><p>Congratulations and welcome to Knytra! We are excited to have you on board.</p>`
  },
  rejected: {
    subject: "Application Update from Knytra",
    html: ({ candidateName, jobTitle }) => `<p>Dear ${candidateName},</p><p>Thank you for your interest${jobTitle ? ` in the position of ${jobTitle}` : ""} at Knytra. We regret to inform you that we will not be moving forward with your application at this time.</p>`
  },
};
