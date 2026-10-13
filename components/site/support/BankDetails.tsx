import type { BankDetails } from "@/lib/data/settings";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-rule py-3 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink sm:text-right">{value}</dd>
    </div>
  );
}

export function BankDetailsCard({
  bank,
  reference,
}: {
  bank: BankDetails;
  reference?: string;
}) {
  if (!bank.bank || !bank.number || !bank.name) {
    return (
      <p className="border-l-2 border-gold pl-4 text-sm leading-relaxed text-muted">
        Bank transfer is not set up yet. Please use another way to pay.
      </p>
    );
  }

  return (
    <dl className="border-b border-rule bg-white px-5">
      <Line label="Bank" value={bank.bank} />
      <Line label="Account number" value={bank.number} />
      <Line label="Account name" value={bank.name} />
      {reference && (
        <Line label="Reference (put this in the narration)" value={reference} />
      )}
    </dl>
  );
}
