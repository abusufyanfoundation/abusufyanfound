import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth/AuthShell";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { LoginForm } from "@/components/admin/auth/LoginForm";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string }>;
}) {
  const { reset, error } = await searchParams;

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
