import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { Container } from "./Container";

export async function AnnouncementBar() {
  const { announcement } = await getSiteSettings();
  if (!announcement.enabled || !announcement.text) return null;

  const link = "font-medium underline underline-offset-4";
  const external = announcement.linkHref.startsWith("https://");

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="bg-gold text-navy-deep"
    >
      <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center text-sm">
        <p>{announcement.text}</p>
        {announcement.linkHref &&
          announcement.linkLabel &&
          (external ? (
            <a
              href={announcement.linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              {announcement.linkLabel}
            </a>
          ) : (
            <Link href={announcement.linkHref} className={link}>
              {announcement.linkLabel}
            </Link>
          ))}
      </Container>
    </div>
  );
}
