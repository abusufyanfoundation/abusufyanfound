"use client";

import { useState } from "react";

const button =
  "border border-navy bg-white px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white disabled:opacity-60";

const fileName = (title: string) =>
  `${
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "campaign"
  }.jpg`;

export function ShareCampaign({
  title,
  imageUrl,
  caption,
}: {
  title: string;
  imageUrl: string | null;
  caption: string;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the caption is still shown, so it can be selected by hand
    }
  }

  async function downloadImage() {
    if (!imageUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName(title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // The browser blocked the direct download: open the image so it can be saved
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink">Share this campaign</p>

      <ol className="mt-3 flex flex-col gap-1 text-sm text-muted">
        {imageUrl && <li>1. Download the image.</li>}
        <li>{imageUrl ? "2" : "1"}. Copy the caption below.</li>
        <li>
          {imageUrl ? "3" : "2"}. Post both on WhatsApp, Facebook, Instagram or
          anywhere you like.
        </li>
      </ol>

      <p className="mt-4 max-w-xl whitespace-pre-line border border-rule bg-paper px-4 py-3 text-sm leading-relaxed text-ink">
        {caption}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {imageUrl && (
          <button
            type="button"
            onClick={downloadImage}
            disabled={downloading}
            className={button}
          >
            {downloading ? "Downloading…" : "Download image"}
          </button>
        )}
        <button type="button" onClick={copyCaption} className={button}>
          {copied ? "Caption copied" : "Copy caption"}
        </button>
      </div>
    </div>
  );
}
