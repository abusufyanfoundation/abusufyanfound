"use client";

import { useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

const button =
  "border border-navy bg-white px-3.5 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white";

export function ShareButtons({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text: string;
}) {
  // Phones and some browsers offer their own share sheet
  const canNativeShare = useSyncExternalStore(
    noopSubscribe,
    () =>
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false,
  );
  const [copied, setCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);

  const enc = encodeURIComponent;
  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
      newTab: true,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      newTab: true,
      copyCaption: true,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
      newTab: true,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
      newTab: true,
    },
    {
      label: "Email",
      href: `mailto:?subject=${enc(title)}&body=${enc(`${text}\n\n${url}`)}`,
      newTab: false,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the other buttons still work
    }
  }

  // Facebook cannot pre-fill the post box, so the caption goes to the clipboard
  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 6000);
    } catch {
      // Clipboard blocked: Facebook still shows the link preview
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // The person closed the share sheet
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">Share this campaign</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={button}>
            Share…
          </button>
        )}
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...(link.newTab
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            onClick={link.copyCaption ? copyCaption : undefined}
            className={button}
          >
            {link.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className={button}>
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
      {captionCopied && (
        <p role="status" className="mt-3 text-sm text-muted">
          Caption copied. Paste it into your Facebook post.
        </p>
      )}
    </div>
  );
}
