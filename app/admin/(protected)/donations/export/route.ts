import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { cleanSearch } from "@/lib/admin/filters";
import { createClient } from "@/lib/supabase/server";

const csv = (value: unknown) => {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  await requireAdmin();

  const supabase = await createClient();

  const url = new URL(request.url);

  const q = cleanSearch(url.searchParams.get("q") ?? undefined);

  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  let query = supabase
    .from("donations")
    .select(
      "id, created_at, donor_name, donor_email, type, amount_kobo, is_paid",
    );

  if (q) {
    query = query.or(`donor_name.ilike.%${q}%,donor_email.ilike.%${q}%`);
  }

  if (status === "paid") {
    query = query.eq("is_paid", true);
  }

  if (status === "pending") {
    query = query.eq("is_paid", false);
  }

  if (type === "general" || type === "book") {
    query = query.eq("type", type);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    console.error("donations export:", error);

    return new NextResponse("Could not export donations.", {
      status: 500,
    });
  }

  const rows = [
    ["ID", "Date", "Donor", "Email", "Type", "Amount (kobo)", "Paid"],

    ...(data ?? []).map((donation) => [
      donation.id,
      donation.created_at,
      donation.donor_name,
      donation.donor_email,
      donation.type,
      donation.amount_kobo,
      donation.is_paid ? "Yes" : "No",
    ]),
  ];

  const body = rows.map((row) => row.map(csv).join(",")).join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",

      "Content-Disposition": `attachment; filename="donations-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
