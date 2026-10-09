import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AuditEntity =
  | "campaign"
  | "book"
  | "order"
  | "beneficiary"
  | "donation"
  | "batch"
  | "application"
  | "book_request"
  | "session";

export type AuditEntry = {
  action: string;
  entity: AuditEntity;
  entityId?: string | null;
  summary: string;
  details?: Record<string, unknown>;
};

type Actor = { user: User; profile?: { full_name?: string | null } | null };

// Records what an admin did. A failure to log never blocks the action itself,
// but it is reported in the server log.
export async function logAudit(
  supabase: SupabaseClient,
  actor: Actor,
  entry: AuditEntry,
) {
  const { error } = await supabase.from("audit_log").insert({
    actor_id: actor.user.id,
    actor_name: actor.profile?.full_name ?? null,
    actor_email: actor.user.email ?? null,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    summary: entry.summary,
    details: entry.details ?? null,
  });

  if (error) console.error("logAudit:", error.message);
}
