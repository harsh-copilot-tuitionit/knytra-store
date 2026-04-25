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
    subject: "We’ve received your application — KNYTRA",
    html: ({ candidateName, jobTitle }) => `
      <p>Hi ${candidateName},</p>
      <p>Thank you for applying to <b>KNYTRA</b>${jobTitle ? ` for the role of <b>${jobTitle}</b>` : ""}.</p>
      <p>We’ve successfully received your application and our team is currently reviewing it.</p>
      <p>At KNYTRA, we’re building more than just a brand — we’re building a culture of intent, creativity, and ownership. Every application we receive is carefully considered, and we truly appreciate the time and effort you’ve put in.</p>
      <p><b>What happens next?</b></p>
      <p>If your profile aligns with what we’re looking for, you’ll hear from us regarding the next steps in the process.</p>
      <p>While you wait, get to know us better:</p>
      <ul>
        <li>Website: <a href="https://knytra.in">https://knytra.in</a></li>
        <li>Instagram: <a href="https://instagram.com/knytra.in">https://instagram.com/knytra.in</a></li>
        <li>Our Story & Vision: <a href="https://knytra.in/about">https://knytra.in/about</a></li>
      </ul>
      <p>We appreciate your interest in being part of KNYTRA.</p>
      <p>Wishing you the very best — we’ll be in touch soon.</p>
      <p>Warm regards,<br/>KNYTRA Team</p>
    `,
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
