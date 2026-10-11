import { AdminActiveToggle } from "@/components/admin/AdminActiveToggle";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { FormMessage } from "@/components/admin/auth/FormMessage";
import { PageHeader, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { Toggle } from "@/components/ui/Toggle";
import { requireSuperAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Team",
  robots: { index: false, follow: false },
};

type Member = {
  id: string;
  full_name: string | null;
  is_active: boolean;
  is_super_admin: boolean;
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const actor = await requireSuperAdmin();
  const { error, notice } = await searchParams;

  const supabase = await createClient();

  const [members, users] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, is_active, is_super_admin")
      .eq("role", "admin")
      .order("full_name")
      .returns<Member[]>(),
    createAdminClient().auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);

  const emails = new Map(users.data.users.map((u) => [u.id, u.email ?? ""]));
  const rows = members.data ?? [];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Team"
        intro="Invite administrators and switch their access on or off. Deactivated administrators keep their history in the activity log."
      />

      {error && <FormMessage error={error} />}
      {notice && <FormMessage message={notice} />}

      <section>
        <h2 className="mb-4 font-display text-xl text-navy">Administrators</h2>
        <TableWrap>
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className={th}>Administrator</th>
              <th className={th}>Role</th>
              <th className={th}>Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((m) => {
              const name = m.full_name ?? emails.get(m.id) ?? "Administrator";
              const self = m.id === actor.user.id;

              return (
                <tr key={m.id}>
                  <td className={td}>
                    <span className="font-medium">{name}</span>
                    <span className="block text-xs text-muted">
                      {emails.get(m.id)}
                    </span>
                  </td>
                  <td className={td}>
                    {m.is_super_admin ? "Super admin" : "Admin"}
                    {self && <span className="text-muted"> (you)</span>}
                  </td>
                  <td className={td}>
                    {self || m.is_super_admin ? (
                      <Toggle
                        label="Active"
                        name="active"
                        defaultChecked
                        disabled
                      />
                    ) : (
                      <AdminActiveToggle
                        key={`${m.id}-${m.is_active}-${notice ?? error ?? ""}`}
                        id={m.id}
                        name={name}
                        active={m.is_active}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </section>
      <Panel title="Invite an administrator">
        <InviteAdminForm />
      </Panel>

    </div>
  );
}
