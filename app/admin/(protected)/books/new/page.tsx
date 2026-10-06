import { BookForm } from "@/components/admin/BookForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "Add a book",
  robots: { index: false, follow: false },
};

export default async function NewBookPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Add a book"
        intro="Books you mark as Available appear on the website for supporters to pre-fund."
      />
      <BookForm />
    </div>
  );
}
