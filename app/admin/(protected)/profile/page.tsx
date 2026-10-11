import { PasswordForm } from "@/components/admin/PasswordForm";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const { user, profile, isSuperAdmin } = await requireAdmin();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="My profile"
        intro={`You are signed in as ${isSuperAdmin ? "a super admin" : "an administrator"}.`}
      />

      <section>
        <h2 className="mb-5 font-display text-xl text-navy">Details</h2>
        <ProfileForm fullName={profile.full_name} email={user.email ?? ""} />
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl text-navy">Password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
