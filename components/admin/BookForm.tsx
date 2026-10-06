"use client";

import Image from "next/image";
import { saveBook } from "@/app/admin/(protected)/books/actions";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useActionForm } from "@/lib/forms/use-action-form";
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

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <FormMessage error={state?.error} message={state?.message} />

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

      {!book && (
        <TextField
          label="Copies available"
          name="quantity"
          type="number"
          min={0}
          step={1}
          defaultValue={0}
          hint="You can add or remove copies later from the book's page."
        />
      )}

      <SelectField
        label="Status"
        name="status"
        defaultValue={book?.status ?? "draft"}
        hint="Only “Available” books appear on the website."
        options={[
          { value: "draft", label: "Draft" },
          { value: "available", label: "Available" },
          { value: "unavailable", label: "Unavailable" },
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

      <div>
        <SubmitButton pending={pending} pendingText="Saving…">
          Save book
        </SubmitButton>
      </div>
    </form>
  );
}
