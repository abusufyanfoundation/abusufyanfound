import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { siteName } from "./site-name";

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

let transporter: Transporter | null = null;

function getTransporter(user: string, pass: string) {
  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    pool: true,
    maxConnections: 3,
    auth: { user, pass },
  });
  return transporter;
}

// Never throws. A failed email is logged and never breaks the action that caused it.
export async function sendMail(mail: Mail): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error("sendMail: GMAIL_USER or GMAIL_APP_PASSWORD is not set");
    return false;
  }

  try {
    await getTransporter(user, pass).sendMail({
      from: { name: await siteName(), address: user },
      replyTo: user,
      ...mail,
    });
    return true;
  } catch (error) {
    console.error(
      "sendMail failed:",
      mail.subject,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
