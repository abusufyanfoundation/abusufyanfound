export type TrackResult =
  | {
      kind: "application";
      reference: string;
      status: string;
      submitted_at: string;
      batch: string;
      method: "pickup" | "delivery" | null;
      location: { name: string; address: string } | null;
      items: { title: string; requested: number; approved: number }[];
    }
  | {
      kind: "request";
      reference: string;
      status: string;
      submitted_at: string;
      book: string;
      quantity: number;
    };

export type TrackState = { error?: string; result?: TrackResult } | undefined;
