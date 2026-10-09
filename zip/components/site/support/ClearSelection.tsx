"use client";

import { useEffect } from "react";
import { useSelection } from "@/components/site/selection/SelectionProvider";

// After a successful book payment the saved selection is no longer needed
export function ClearSelection() {
  const { clear } = useSelection();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
