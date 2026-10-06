"use client";

import { useActionState, useState } from "react";
import { startGeneralDonation } from "@/app/(site)/support/actions";
import { DonorFields } from "./DonorFields";
import { Notice } from "./Notice";
import { SubmitButton } from "./SubmitButton";

const presets = [5000, 10000, 25000, 50000];

export function GeneralDonationForm() {
  const [state, action] = useActionState(startGeneralDonation, undefined);
  const [amount, setAmount] = useState("");

  return (
    <form action={action} className="flex flex-col gap-6">
      <Notice error={state?.error} />

      <div className="flex flex-col gap-3">
        <label htmlFor="amount" className="text-sm font-medium text-ink">
          Amount (₦)
        </label>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className={`border px-4 py-2 text-sm transition-colors ${
                Number(amount) === p
                  ? "border-navy bg-navy text-white"
                  : "border-rule bg-white text-navy hover:border-navy"
              }`}
            >
              ₦{p.toLocaleString("en-NG")}
            </button>
          ))}
        </div>

        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="numeric"
          min={100}
          step={1}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter an amount"
          className="border border-rule bg-white px-3.5 py-3 text-base text-ink transition-colors focus:border-navy"
        />
        <p className="text-xs text-muted">The minimum is ₦100.</p>
      </div>

      <DonorFields />

      <div className="flex flex-col items-start gap-3 pt-1">
        <SubmitButton pendingText="Preparing payment…">
          Continue to payment
        </SubmitButton>
        <p className="text-xs text-muted">
          You will be taken to Paystack to pay securely. We never see or store
          your card details.
        </p>
      </div>
    </form>
  );
}
