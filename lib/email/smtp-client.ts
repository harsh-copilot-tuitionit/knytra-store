import nodemailer from "nodemailer";

const host = process.env.ZOHO_SMTP_HOST;
const port = process.env.ZOHO_SMTP_PORT ? parseInt(process.env.ZOHO_SMTP_PORT, 10) : 465;
const secure = process.env.ZOHO_SMTP_SECURE === "true";
const user = process.env.ZOHO_SMTP_USER;
const pass = process.env.ZOHO_SMTP_PASS;

if (!host || !port || !user || !pass) {
  throw new Error("Missing Zoho SMTP environment variables");
}

const CAREERS_CC_EMAIL = process.env.CAREERS_CC_EMAIL || "recruitment@knytra.com";

/**
 * Wraps nodemailer transport to always include CC to recruitment@knytra.com (configurable).
 * If caller passes cc, ensures recruitment@knytra.com is included (no duplicates).
 */
import type { SendMailOptions } from 'nodemailer';
export const smtpTransport = {
  sendMail: async (options: SendMailOptions) => {
    let ccList: string[] = [];
    if (options.cc) {
      if (typeof options.cc === "string") {
        ccList = options.cc.split(",").map((e: string) => e.trim());
      } else if (Array.isArray(options.cc)) {
        ccList = options.cc.map((e) => typeof e === 'string' ? e.trim() : (typeof e.address === 'string' ? e.address.trim() : ''));
      }
    }
    if (!ccList.includes(CAREERS_CC_EMAIL)) {
      ccList.push(CAREERS_CC_EMAIL);
    }
    options.cc = ccList.filter(Boolean);
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    }).sendMail(options);
  }
};
