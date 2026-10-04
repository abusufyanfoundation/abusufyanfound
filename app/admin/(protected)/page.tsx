import { signOut } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminHome() {
  const { profile } = await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl">Dashboard</h1>
      <p className="mt-3 text-muted">
        Signed in{profile?.full_name ? ` as ${profile.full_name}` : ""}. The
        full dashboard arrives in Phase 5.
      </p>
      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="border border-navy px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy hover:text-white"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
