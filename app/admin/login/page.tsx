import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth/AuthShell";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { LoginForm } from "@/components/admin/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false },
};

const AUTH_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

// Where to send a signed-in admin: the page they came from, or the dashboard
async function previousPage() {
  const h = await headers();
  const referer = h.get("referer");
  const host = h.get("host");

  if (referer && host) {
    try {
      const from = new URL(referer);
      const isAuthPage = AUTH_PATHS.some((p) => from.pathname.startsWith(p));
      if (from.host === host && !isAuthPage) {
        return `${from.pathname}${from.search}`;
      }
    } catch {
      // A malformed referrer: fall through to the dashboard
    }
  }
  return "/admin";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string }>;
}) {
  const { reset, error } = await searchParams;

  if (!error) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .maybeSingle<{ role: string; is_active: boolean }>();

      if (profile?.role === "admin" && profile.is_active) {
        redirect(await previousPage());
      }
    }
  }

  return (
    <AuthShell
      title="Sign in"
      intro="Administrator access for the Abu Sufyan Al-Alma'iyy Foundation."
    >
      <div className="flex flex-col gap-5">
        {reset === "success" && (
          <FormMessage message="Your password has been updated. Please sign in." />
        )}
        {error === "unauthorised" && (
          <FormMessage error="That account does not have administrator access." />
        )}
        <LoginForm />
      </div>
    </AuthShell>
  );
}
