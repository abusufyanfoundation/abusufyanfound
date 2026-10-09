"use client";

import { useState } from "react";
import type { FormState } from "./types";

const NONE = {};

// A form that stays locked until "Edit" is pressed. It locks again by itself
// after a successful save, and stays open if the save fails.
export function useEditMode(state: FormState) {
  const [openedAt, setOpenedAt] = useState<object | null>(null);

  const editing =
    openedAt !== null &&
    (openedAt === (state ?? NONE) || Boolean(state?.error));

  return {
    editing,
    start: () => setOpenedAt(state ?? NONE),
    cancel: () => setOpenedAt(null),
  };
}
