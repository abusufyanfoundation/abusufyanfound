"use client";

import { setAdminActive } from "@/app/admin/(protected)/team/actions";
import { Toggle } from "@/components/ui/Toggle";

export function AdminActiveToggle({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  return (
    <form action={setAdminActive}>
      <input type="hidden" name="id" value={id} />
      <Toggle
        label="Active"
        name="active"
        value="true"
        defaultChecked={active}
        onChange={(event) => {
          const input = event.currentTarget;
          if (
            !input.checked &&
            !window.confirm(
              `Deactivate ${name}? They will lose access immediately.`,
            )
          ) {
            input.checked = true;
            return;
          }
          input.form?.requestSubmit();
        }}
      />
    </form>
  );
}
