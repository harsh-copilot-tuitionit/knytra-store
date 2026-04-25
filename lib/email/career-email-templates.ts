export type CareerEmailTemplateType =
  | "application_received"
  | "shortlisted"
  | "assessment"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";


type SignatureVariant = "default" | "rejected" | "hired";

interface CareerEmailTemplate {
  subject: string;
  html: (params: { candidateName: string; jobTitle?: string }) => string;
  text: (params: { candidateName: string; jobTitle?: string }) => string;
}

/**
 * Renders the branded KNYTRA email layout.
 * All CSS is inline, no external resources.
 */
export function renderKnytraEmailLayout({
  preheader,
  eyebrow,
  title,
  bodyHtml,
  signatureVariant = "default",
  footerNote = "This is an automated email from KNYTRA Careers.",
}: {
  preheader: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  signatureVariant?: SignatureVariant;
  footerNote?: string;
}) {
  // Signature block
  let signatureHtml = "";
  let signatureText = "";
  if (signatureVariant === "hired") {
    signatureHtml = `
      <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.12)">
        <div style="font-size:16px;font-weight:bold;color:#fff;margin-bottom:2px">Welcome aboard,</div>
        <div style="font-size:15px;color:#fff;margin-bottom:8px">KNYTRA Careers Team</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60);margin-bottom:2px">KNYTRA NOTIFICATIONS</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60);margin-bottom:2px">noreply@knytra.com</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60)"><a href=\"https://knytra.in\" style=\"color:rgba(255,255,255,0.60);text-decoration:none\">https://knytra.in</a></div>
      </td></tr>
    `;
    signatureText = `\nWelcome aboard,\nKNYTRA Careers Team\n\nKNYTRA NOTIFICATIONS\nnoreply@knytra.com\nhttps://knytra.in`;
  } else if (signatureVariant === "rejected") {
    signatureHtml = `
      <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.12)">
        <div style="font-size:16px;font-weight:bold;color:#fff;margin-bottom:2px">With appreciation,</div>
        <div style="font-size:15px;color:#fff;margin-bottom:8px">KNYTRA Careers Team</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60);margin-bottom:2px">KNYTRA NOTIFICATIONS</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60);margin-bottom:2px">noreply@knytra.com</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60)"><a href=\"https://knytra.in\" style=\"color:rgba(255,255,255,0.60);text-decoration:none\">https://knytra.in</a></div>
      </td></tr>
    `;
    signatureText = `\nWith appreciation,\nKNYTRA Careers Team\n\nKNYTRA NOTIFICATIONS\nnoreply@knytra.com\nhttps://knytra.in`;
  } else {
    signatureHtml = `
      <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.12)">
        <div style="font-size:16px;font-weight:bold;color:#fff;margin-bottom:2px">Warm regards,</div>
        <div style="font-size:15px;color:#fff;margin-bottom:8px">KNYTRA Careers Team</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60);margin-bottom:2px">KNYTRA NOTIFICATIONS</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60);margin-bottom:2px">noreply@knytra.com</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.60)"><a href=\"https://knytra.in\" style=\"color:rgba(255,255,255,0.60);text-decoration:none\">https://knytra.in</a></div>
      </td></tr>
    `;
    signatureText = `\nWarm regards,\nKNYTRA Careers Team\n\nKNYTRA NOTIFICATIONS\nnoreply@knytra.com\nhttps://knytra.in`;
  }

  return {
    html: `
      <html>
        <body style="margin:0;padding:0;background:#000;color:#fff;font-family:Arial,Helvetica,sans-serif;">
          <span style="display:none!important;max-height:0;max-width:0;opacity:0;overflow:hidden;visibility:hidden">${preheader}</span>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000;max-width:480px;margin:0 auto;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.10);border:1px solid #222;">
            <tr><td style="padding:32px 24px 0 24px">
              <div style="font-size:24px;font-weight:900;letter-spacing:2px;color:#fff;margin-bottom:8px;">KNYTRA</div>
              <div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:rgba(255,255,255,0.60);margin-bottom:24px;">CAREERS</div>
              <div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:12px;">${title}</div>
              <div style="font-size:15px;color:#fff;margin-bottom:24px;">${bodyHtml}</div>
            </td></tr>
            ${signatureHtml}
            <tr><td style="padding:32px 24px 16px 24px">
              <div style="font-size:13px;color:rgba(255,255,255,0.60);margin-bottom:16px;">Explore KNYTRA:<br/>
                <a href=\"https://knytra.in\" style=\"color:rgba(255,255,255,0.60);text-decoration:none\">Website</a> &nbsp;|&nbsp;
                <a href=\"https://instagram.com/knytra.in\" style=\"color:rgba(255,255,255,0.60);text-decoration:none\">Instagram</a> &nbsp;|&nbsp;
                <a href=\"https://knytra.in/about\" style=\"color:rgba(255,255,255,0.60);text-decoration:none\">About</a>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.40);">${footerNote}</div>
            </td></tr>
          </table>
        </body>
      </html>
    `,
    text: `${eyebrow ? eyebrow + '\n' : ''}${title}\n\n${bodyHtml.replace(/<[^>]+>/g, '').replace(/\n+/g, '\n').trim()}${signatureText}\n\nExplore KNYTRA:\nhttps://knytra.in\nhttps://instagram.com/knytra.in\nhttps://knytra.in/about\n\n${footerNote}`
  };
}

export const careerEmailTemplates: Record<CareerEmailTemplateType, CareerEmailTemplate> = {
  application_received: {
    subject: "We’ve received your application — KNYTRA",
    html: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `We’ve received your application at KNYTRA. Our team will review it soon.`,
      eyebrow: "APPLICATION RECEIVED",
      title: "We’ve received your application",
      bodyHtml: `Hi <b>${candidateName}</b>,<br><br>Thank you for applying to <b>KNYTRA</b>${jobTitle ? ` for the role of <b>${jobTitle}</b>` : ""}.<br><br>We’ve successfully received your application and our team is currently reviewing it.<br><br>At KNYTRA, we’re building more than just a brand — we’re building a culture of intent, creativity, and ownership. Every application we receive is carefully considered, and we truly appreciate the time and effort you’ve put in.<br><br>If your profile aligns with what we’re looking for, you’ll hear from us regarding the next steps.`,
      signatureVariant: "default",
    }).html,
    text: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `We’ve received your application at KNYTRA. Our team will review it soon.`,
      eyebrow: "APPLICATION RECEIVED",
      title: "We’ve received your application",
      bodyHtml: `Hi ${candidateName},\n\nThank you for applying to KNYTRA${jobTitle ? ` for the role of ${jobTitle}` : ""}.\n\nWe’ve successfully received your application and our team is currently reviewing it.\n\nAt KNYTRA, we’re building more than just a brand — we’re building a culture of intent, creativity, and ownership. Every application we receive is carefully considered, and we truly appreciate the time and effort you’ve put in.\n\nIf your profile aligns with what we’re looking for, you’ll hear from us regarding the next steps.`,
      signatureVariant: "default",
    }).text,
  },
  shortlisted: {
    subject: "You’ve been shortlisted — KNYTRA",
    html: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve been shortlisted for the next stage at KNYTRA.`,
      eyebrow: "SHORTLISTED",
      title: "You’ve been shortlisted",
      bodyHtml: `Hi <b>${candidateName}</b>,<br><br>Your application${jobTitle ? ` for <b>${jobTitle}</b>` : ""} has been shortlisted.<br><br>We saw something promising in your profile and would like to move you forward in the process. Our team will share the next steps soon.`,
      signatureVariant: "default",
    }).html,
    text: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve been shortlisted for the next stage at KNYTRA.`,
      eyebrow: "SHORTLISTED",
      title: "You’ve been shortlisted",
      bodyHtml: `Hi ${candidateName},\n\nYour application${jobTitle ? ` for ${jobTitle}` : ""} has been shortlisted.\n\nWe saw something promising in your profile and would like to move you forward in the process. Our team will share the next steps soon.`,
      signatureVariant: "default",
    }).text,
  },
  assessment: {
    subject: "Next step: Assessment — KNYTRA",
    html: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve moved to the assessment stage at KNYTRA.`,
      eyebrow: "ASSESSMENT",
      title: "Next step: Assessment",
      bodyHtml: `Hi <b>${candidateName}</b>,<br><br>You’ve moved to the assessment stage${jobTitle ? ` for <b>${jobTitle}</b>` : ""}.<br><br>This step helps us understand your thinking, ownership, creativity, and role fit. Please keep an eye on your email for assessment instructions or links.`,
      signatureVariant: "default",
    }).html,
    text: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve moved to the assessment stage at KNYTRA.`,
      eyebrow: "ASSESSMENT",
      title: "Next step: Assessment",
      bodyHtml: `Hi ${candidateName},\n\nYou’ve moved to the assessment stage${jobTitle ? ` for ${jobTitle}` : ""}.\n\nThis step helps us understand your thinking, ownership, creativity, and role fit. Please keep an eye on your email for assessment instructions or links.`,
      signatureVariant: "default",
    }).text,
  },
  interview: {
    subject: "Interview stage — KNYTRA",
    html: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve moved to the interview stage at KNYTRA.`,
      eyebrow: "INTERVIEW",
      title: "Interview stage",
      bodyHtml: `Hi <b>${candidateName}</b>,<br><br>You’ve moved to the interview stage${jobTitle ? ` for <b>${jobTitle}</b>` : ""}.<br><br>Our team will coordinate the interview details with you shortly. Please be prepared to discuss your experience, motivation, and how you think you can contribute to KNYTRA.`,
      signatureVariant: "default",
    }).html,
    text: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve moved to the interview stage at KNYTRA.`,
      eyebrow: "INTERVIEW",
      title: "Interview stage",
      bodyHtml: `Hi ${candidateName},\n\nYou’ve moved to the interview stage${jobTitle ? ` for ${jobTitle}` : ""}.\n\nOur team will coordinate the interview details with you shortly. Please be prepared to discuss your experience, motivation, and how you think you can contribute to KNYTRA.`,
      signatureVariant: "default",
    }).text,
  },
  offer: {
    subject: "Offer stage — KNYTRA",
    html: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve moved to the offer stage at KNYTRA.`,
      eyebrow: "OFFER",
      title: "Offer stage",
      bodyHtml: `Hi <b>${candidateName}</b>,<br><br>You’ve moved to the offer stage${jobTitle ? ` for <b>${jobTitle}</b>` : ""}.<br><br>We’re excited about the possibility of having you contribute to KNYTRA. Our team will share the next details with you soon.`,
      signatureVariant: "default",
    }).html,
    text: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `You’ve moved to the offer stage at KNYTRA.`,
      eyebrow: "OFFER",
      title: "Offer stage",
      bodyHtml: `Hi ${candidateName},\n\nYou’ve moved to the offer stage${jobTitle ? ` for ${jobTitle}` : ""}.\n\nWe’re excited about the possibility of having you contribute to KNYTRA. Our team will share the next details with you soon.`,
      signatureVariant: "default",
    }).text,
  },
  hired: {
    subject: "Welcome to KNYTRA",
    html: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `Congratulations — you’ve been selected for ${jobTitle || "a role"} at KNYTRA.`,
      eyebrow: "HIRED",
      title: "Welcome to KNYTRA",
      bodyHtml: `Hi <b>${candidateName}</b>,<br><br>Congratulations — you’ve been selected${jobTitle ? ` for <b>${jobTitle}</b>` : ""} at KNYTRA.<br><br>We’re excited to have you move forward with us. Our team will contact you with the onboarding details soon.`,
      signatureVariant: "hired",
    }).html,
    text: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `Congratulations — you’ve been selected for ${jobTitle || "a role"} at KNYTRA.`,
      eyebrow: "HIRED",
      title: "Welcome to KNYTRA",
      bodyHtml: `Hi ${candidateName},\n\nCongratulations — you’ve been selected${jobTitle ? ` for ${jobTitle}` : ""} at KNYTRA.\n\nWe’re excited to have you move forward with us. Our team will contact you with the onboarding details soon.`,
      signatureVariant: "hired",
    }).text,
  },
  rejected: {
    subject: "Update on your KNYTRA application",
    html: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `Update on your KNYTRA application.`,
      eyebrow: "APPLICATION UPDATE",
      title: "Update on your KNYTRA application",
      bodyHtml: `Hi <b>${candidateName}</b>,<br><br>Thank you for applying to <b>KNYTRA</b>${jobTitle ? ` for <b>${jobTitle}</b>` : ""}.<br><br>After careful review, we won’t be moving forward with your application at this time.<br><br>We truly appreciate your interest, time, and effort. We encourage you to stay connected with KNYTRA and apply again for future opportunities that match your profile.`,
      signatureVariant: "rejected",
    }).html,
    text: ({ candidateName, jobTitle }) => renderKnytraEmailLayout({
      preheader: `Update on your KNYTRA application.`,
      eyebrow: "APPLICATION UPDATE",
      title: "Update on your KNYTRA application",
      bodyHtml: `Hi ${candidateName},\n\nThank you for applying to KNYTRA${jobTitle ? ` for ${jobTitle}` : ""}.\n\nAfter careful review, we won’t be moving forward with your application at this time.\n\nWe truly appreciate your interest, time, and effort. We encourage you to stay connected with KNYTRA and apply again for future opportunities that match your profile.`,
      signatureVariant: "rejected",
    }).text,
  },
};
