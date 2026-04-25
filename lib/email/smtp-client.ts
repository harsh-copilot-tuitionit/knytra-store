import nodemailer from "nodemailer";

const host = process.env.ZOHO_SMTP_HOST;
const port = process.env.ZOHO_SMTP_PORT ? parseInt(process.env.ZOHO_SMTP_PORT, 10) : 465;
const secure = process.env.ZOHO_SMTP_SECURE === "true";
const user = process.env.ZOHO_SMTP_USER;
const pass = process.env.ZOHO_SMTP_PASS;

if (!host || !port || !user || !pass) {
  throw new Error("Missing Zoho SMTP environment variables");
}

export const smtpTransport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
});
