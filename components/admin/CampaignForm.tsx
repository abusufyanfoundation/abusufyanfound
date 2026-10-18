"use client";

import Image from "next/image";
import { useRef } from "react";
import { saveCampaign } from "@/app/admin/(protected)/campaigns/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { useEditMode } from "@/lib/forms/use-edit-mode";
import {
  SelectField,
  ToggleField,
  FileField,
  TextArea,
  TextField,
} from "./forms/fields";
export type CampaignFormValues = {
  id: string;
  title: string;
  description: string | null;
  target_kobo: number;
  is_active: boolean;
  image_url: string | null;
  completed: boolean;
  campaignType: string;
};

export function CampaignForm({ campaign }: { campaign?: CampaignFormValues }) {
  const { state, pending, onSubmit } = useActionForm(saveCampaign);
  const { editing, start, cancel } = useEditMode(state);
  const formRef = useRef<HTMLFormElement>(null);

  // An existing campaign stays locked until "Edit details" is pressed
  const locked = Boolean(campaign) && !editing;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex max-w-2xl flex-col gap-6"
    >
      <FormMessage
        error={locked ? undefined : state?.error}
        message={locked ? state?.message : undefined}
      />

      <fieldset
        disabled={locked}
        className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0"
      >
        {campaign && <input type="hidden" name="id" value={campaign.id} />}

        <TextField label="Title" name="title" defaultValue={campaign?.title} />

        {!campaign && (
          <SelectField
            label="Type"
            name="campaignType"
            defaultValue="normal"
            options={[
              {
                value: "normal",
                label: "General: a fund with no book batches",
              },
              {
                value: "batch",
                label: "Batch-based: its funds buy batches of books",
              },
            ]}
            hint="This cannot be changed once the campaign has batches."
          />
        )}
        <TextArea
          label="Description"
          name="description"
          defaultValue={campaign?.description ?? ""}
          hint="Shown on the website under the campaign title."
        />

        {campaign?.campaignType !== "batch" && (
          <TextField
            label="Target amount (₦)"
            name="targetNaira"
            type="number"
            min={1}
            step="any"
            defaultValue={campaign ? campaign.target_kobo / 100 : undefined}
            hint={
              campaign
                ? undefined
                : "Ignored for a batch-based campaign: each batch has its own target."
            }
          />
        )}

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
            hint="JPG, PNG or WebP, up to 4 MB. This image also appears when the campaign is shared on social media."
          />
        </div>

        {!campaign?.completed && (
          <ToggleField
            label="Make this the active campaign"
            name="isActive"
            defaultChecked={campaign?.is_active}
            hint="One batch-based and one general campaign can be active at the same time. Active campaigns appear on the homepage."
          />
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        {locked ? (
          <button
            type="button"
            onClick={start}
            className="border border-navy px-5 py-3 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Edit details
          </button>
        ) : (
          <>
            <SubmitButton pending={pending} pendingText="Saving…">
              Save campaign
            </SubmitButton>
            {campaign && (
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
            )}
          </>
        )}
      </div>
    </form>
  );
}
