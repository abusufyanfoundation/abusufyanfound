import { siteConfig, siteUrl } from "@/lib/site";
import type { Mail } from "./transport";

export const esc = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export type Content = {
  subject: string;
  name?: string | null;
  intro: string[];
  rows?: [label: string, value: string][];
  outro?: string[];
  button?: { label: string; href: string };
};

const NAVY = "#022569";
const GOLD = "#cca957";
const MUTED = "#5f6368";
const RULE = "#e6e1d3";

// One content object produces both the HTML and the plain-text version
export function compose(
  c: Content,
  siteName: string = siteConfig.name,
): Omit<Mail, "to"> {
  const greeting = c.name
    ? `As-salamu alaykum ${c.name},`
    : "As-salamu alaykum,";
  const signOff = ["Was-salamu alaykum,", siteName];

  const para = (text: string) =>
    `<p style="margin:0 0 16px;line-height:1.65;">${esc(text)}</p>`;

  const rows = c.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border-collapse:collapse;">${c.rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:10px 12px 10px 0;border-top:1px solid ${RULE};color:${MUTED};font-size:14px;vertical-align:top;width:38%;">${esc(label)}</td><td style="padding:10px 0;border-top:1px solid ${RULE};font-size:15px;font-weight:bold;vertical-align:top;">${esc(value).replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("")}</table>`
    : "";

  const button = c.button
    ? `<p style="margin:8px 0 24px;"><a href="${esc(c.button.href)}" style="background:${NAVY};color:#ffffff;padding:12px 22px;text-decoration:none;font-size:15px;display:inline-block;border-radius:2px;">${esc(c.button.label)}</a></p>`
    : "";

  const html = `<!doctype html>
<html>
<body style="margin:0;background:#f5f3ec;font-family:Georgia,'Times New Roman',serif;color:#1b1b1b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;">
<tr><td style="background:${NAVY};border-bottom:3px solid ${GOLD};padding:20px 28px;color:${GOLD};font-size:18px;">${esc(siteName)}</td></tr>
<tr><td style="padding:28px;font-size:16px;">
${para(greeting)}
${c.intro.map(para).join("")}
${rows}
${(c.outro ?? []).map(para).join("")}
${button}
<p style="margin:0;line-height:1.65;">${signOff.map(esc).join("<br>")}</p>
</td></tr>
<tr><td style="background:#faf8f2;padding:18px 28px;color:${MUTED};font-size:13px;line-height:1.6;">You can reply to this email and it will reach the Foundation.<br>${esc(siteUrl)}</td></tr>
</table>
</td></tr></table>
</body>
</html>`;

  const text = [
    greeting,
    "",
    ...c.intro.flatMap((p) => [p, ""]),
    ...(c.rows?.length
      ? [...c.rows.map(([label, value]) => `${label}: ${value}`), ""]
      : []),
    ...(c.outro ?? []).flatMap((p) => [p, ""]),
    ...(c.button ? [`${c.button.label}: ${c.button.href}`, ""] : []),
    ...signOff,
  ].join("\n");

  return { subject: c.subject, html, text };
}
