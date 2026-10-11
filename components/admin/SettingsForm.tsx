"use client";

import { useRef } from "react";
import { saveSettings } from "@/app/admin/(protected)/settings/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import type { SettingsRow } from "@/lib/data/settings";
import { useActionForm } from "@/lib/forms/use-action-form";
import { useEditMode } from "@/lib/forms/use-edit-mode";
import { TextArea, TextField, ToggleField } from "./forms/fields";

function Group({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-rule pt-8 first:border-t-0 first:pt-0">
      <div>
        <h2 className="font-display text-xl text-navy">{title}</h2>
        {intro && <p className="mt-1 max-w-xl text-sm text-muted">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export function SettingsForm({ settings: s }: { settings: SettingsRow }) {
  const { state, pending, onSubmit } = useActionForm(saveSettings);
  const { editing, start, cancel } = useEditMode(state);
  const formRef = useRef<HTMLFormElement>(null);

  const locked = !editing;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex max-w-2xl flex-col gap-8"
    >
      <FormMessage
        error={locked ? undefined : state?.error}
        message={locked ? state?.message : undefined}
      />

      <fieldset
        disabled={locked}
        className="m-0 flex min-w-0 flex-col gap-8 border-0 p-0"
      >
        <Group
          title="Contact details"
          intro="Shown in the website footer. Leave a field blank to hide it."
        >
          <TextField
            label="Email address"
            name="contactEmail"
            type="email"
            required={false}
            defaultValue={s.contact_email ?? ""}
          />
          <TextArea
            label="Phone numbers"
            name="contactPhone"
            rows={3}
            defaultValue={s.contact_phone ?? ""}
            hint="One number per line, up to 5."
          />
          <TextField
            label="Address"
            name="contactAddress"
            required={false}
            defaultValue={s.contact_address ?? ""}
          />
        </Group>

        <Group
          title="Social links"
          intro="Full links starting with https://. A blank link is hidden from the footer."
        >
          <TextField
            label="Facebook"
            name="facebookUrl"
            type="url"
            required={false}
            defaultValue={s.facebook_url ?? ""}
          />
          <TextField
            label="WhatsApp group"
            name="whatsappUrl"
            type="url"
            required={false}
            defaultValue={s.whatsapp_url ?? ""}
          />
          <TextField
            label="Instagram"
            name="instagramUrl"
            type="url"
            required={false}
            defaultValue={s.instagram_url ?? ""}
          />
          <TextField
            label="YouTube"
            name="youtubeUrl"
            type="url"
            required={false}
            defaultValue={s.youtube_url ?? ""}
          />
        </Group>

        <Group
          title="Announcement banner"
          intro="A strip across the top of every public page."
        >
          <ToggleField
            label="Show the announcement banner"
            name="announcementEnabled"
            defaultChecked={s.announcement_enabled}
          />
          <TextField
            label="Announcement text"
            name="announcementText"
            required={false}
            defaultValue={s.announcement_text ?? ""}
            hint="Up to 200 characters."
          />
          <TextField
            label="Link label (optional)"
            name="announcementLinkLabel"
            required={false}
            defaultValue={s.announcement_link_label ?? ""}
          />
          <TextField
            label="Link address (optional)"
            name="announcementLinkHref"
            required={false}
            defaultValue={s.announcement_link_href ?? ""}
            hint="Starts with https:// for another website, or / for a page on this site, for example /apply."
          />
        </Group>

        <Group
          title="Donations"
          intro="Pausing stops campaign giving and book pre-funding. Payments already started still complete."
        >
          <ToggleField
            label="Pause donations"
            name="donationsPaused"
            defaultChecked={s.donations_paused}
          />
          <TextArea
            label="Message shown while paused"
            name="donationsPausedMessage"
            rows={3}
            defaultValue={s.donations_paused_message ?? ""}
            hint="Leave blank to use the standard wording."
          />
          <TextField
            label="Minimum donation (₦)"
            name="minDonationNaira"
            type="number"
            min={100}
            step={1}
            defaultValue={s.min_donation_naira}
          />
        </Group>

        <Group
          title="Applications"
          intro="Pausing stops new batch applications and book requests. Tracking an existing application stays open."
        >
          <ToggleField
            label="Pause applications"
            name="applicationsPaused"
            defaultChecked={s.applications_paused}
          />
          <TextArea
            label="Message shown while paused"
            name="applicationsPausedMessage"
            rows={3}
            defaultValue={s.applications_paused_message ?? ""}
            hint="Leave blank to use the standard wording."
          />
        </Group>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        {locked ? (
          <button
            type="button"
            onClick={start}
            className="border border-navy px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Edit settings
          </button>
        ) : (
          <>
            <SubmitButton pending={pending} pendingText="Saving…">
              Save settings
            </SubmitButton>
            <button
              type="button"
              onClick={() => {
                formRef.current?.reset();
                cancel();
              }}
              className="text-sm text-muted underline underline-offset-4 hover:text-navy"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}
