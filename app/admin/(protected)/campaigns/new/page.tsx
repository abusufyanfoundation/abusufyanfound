import { CampaignForm } from "@/components/admin/CampaignForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "New campaign",
  robots: { index: false, follow: false },
};

export default async function NewCampaignPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ label: "Back to campaigns", href: "/admin/campaigns" }}
        title="New campaign"
        intro="A campaign is a general fund with a target. Donors give any amount and do not choose books."
      />
      <CampaignForm />
    </div>
  );
}
