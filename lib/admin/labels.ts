const stockReasons: Record<string, string> = {
  initial_stock: "Initial stock",
  restock: "Restock",
  admin_adjust: "Adjustment",
  reserved: "Reserved by an order",
  reserved_late: "Reserved (late payment)",
  released: "Released",
  expired: "Released (expired)",
  payment_failed: "Released (payment failed)",
};

export const stockReason = (reason: string) => stockReasons[reason] ?? reason;

export const campaignStatus = (c: {
  is_active: boolean;
  completed_at: string | null;
}) => (c.completed_at ? "Completed" : c.is_active ? "Active" : "Inactive");
