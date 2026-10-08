"use client";

import Image from "next/image";
import { useRef } from "react";
import { saveBook } from "@/app/admin/(protected)/books/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
import { useEditMode } from "@/lib/forms/use-edit-mode";
import { FileField, SelectField, TextArea, TextField } from "./forms/fields";

export type BookFormValues = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  price_kobo: number;
  status: string;
  cover_url: string | null;
};

export function BookForm({ book }: { book?: BookFormValues }) {
  const { state, pending, onSubmit } = useActionForm(saveBook);
  const { editing, start, cancel } = useEditMode(state);
  const formRef = useRef<HTMLFormElement>(null);

  // An existing book stays locked until "Edit details" is pressed
  const locked = Boolean(book) && !editing;

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
        {book && <input type="hidden" name="id" value={book.id} />}

        <TextField label="Title" name="title" defaultValue={book?.title} />
        <TextField label="Author" name="author" defaultValue={book?.author} />
        <TextArea
          label="Description"
          name="description"
          defaultValue={book?.description ?? ""}
        />

        <TextField
          label="Price per copy (₦)"
          name="priceNaira"
          type="number"
          min={1}
          step="any"
          defaultValue={book ? book.price_kobo / 100 : undefined}
        />

        <SelectField
          label="Status"
          name="status"
          defaultValue={book?.status ?? "draft"}
          hint="Only “Listed” books appear on the website. Books are bought only after a donor has paid for them."
          options={[
            { value: "draft", label: "Draft" },
            { value: "listed", label: "Listed" },
            { value: "hidden", label: "Hidden" },
          ]}
        />

        <div className="flex flex-col gap-3">
          {book?.cover_url && (
            <Image
              src={book.cover_url}
              alt="Current cover"
              width={96}
              height={128}
              className="h-32 w-auto object-cover"
            />
          )}
          <FileField
            label={book?.cover_url ? "Replace cover" : "Cover image"}
            name="cover"
            hint="JPG, PNG or WebP, up to 4 MB. A portrait image works best."
          />
        </div>
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
              Save book
            </SubmitButton>
            {book && (
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
