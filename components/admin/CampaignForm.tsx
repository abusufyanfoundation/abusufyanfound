"use client";

import Image from "next/image";
import { saveCampaign } from "@/app/admin/(protected)/campaigns/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { CheckField, FileField, TextArea, TextField } from "./forms/fields";

export type CampaignFormValues = {
  id: string;
  title: string;
  description: string | null;
  target_kobo: number;
  is_active: boolean;
  image_url: string | null;
  completed: boolean;
};

export function CampaignForm({ campaign }: { campaign?: CampaignFormValues }) {
  const { state, pending, onSubmit } = useActionForm(saveCampaign);

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <FormMessage error={state?.error} message={state?.message} />

      {campaign && <input type="hidden" name="id" value={campaign.id} />}

      <TextField label="Title" name="title" defaultValue={campaign?.title} />

      <TextArea
        label="Description"
        name="description"
        defaultValue={campaign?.description ?? ""}
        hint="Shown on the website under the campaign title."
      />

      <TextField
        label="Target amount (₦)"
        name="targetNaira"
        type="number"
        min={1}
        step="any"
        defaultValue={campaign ? campaign.target_kobo / 100 : undefined}
      />

      <div className="flex flex-col gap-3">
        {campaign?.image_url && (
          <Image
            src={campaign.image_url}
            alt="Current campaign image"
            width={160}
            height={120}
            className="h-24 w-auto object-cover"
          />
        )}
        <FileField
          label={campaign?.image_url ? "Replace image" : "Campaign image"}
          name="image"
          hint="JPG, PNG or WebP, up to 4 MB."
        />
      </div>

      {!campaign?.completed && (
        <CheckField
          label="Make this the active campaign"
          name="isActive"
          defaultChecked={campaign?.is_active}
          hint="Only one campaign can be active at a time. The active campaign appears on the homepage."
        />
      )}

      <div>
        <SubmitButton pending={pending} pendingText="Saving…">
          Save campaign
        </SubmitButton>
      </div>
    </form>
  );
}
