// src/domain/logic/evidence-bundle.ts
// Evidence bundle creation - pure deterministic transformation

import { compareCursor } from "./cursor.js";
import { redactEvent, redactGatewaySnapshot } from "./redaction.js";
import type {
  AuditEvent,
  GatewayStatus,
  RedactionLevel,
  AuditFilters,
  Outcome,
} from "../types/event.types.js";
import type {
  EvidenceBundle,
  IntegritySummary,
} from "../types/bundle.types.js";

export interface CreateEvidenceBundleParams {
  events: AuditEvent[];
  redactionLevel?: RedactionLevel;
  gatewaySnapshot?: GatewayStatus;
  filters?: AuditFilters;
  cursorRange?: { start?: string; end?: string };
  dashboardVersion: string;
}

export function createEvidenceBundle(
  params: CreateEvidenceBundleParams,
): EvidenceBundle {
  const level = params.redactionLevel ?? "safe_default";

  // 1. Sort events by cursor (canonical order)
  const sortedEvents = [...params.events].sort((a, b) =>
    compareCursor(a.cursor, b.cursor),
  );

  // 2. Apply redaction based on level
  const redactedEvents = sortedEvents.map((e) => redactEvent(e, level));

  // 3. Compute integrity summary
  const by_outcome: Record<Outcome, number> = { OK: 0, DENY: 0, ERROR: 0 };
  const by_denial_reason: Record<string, number> = {};

  redactedEvents.forEach((e) => {
    const outcome = (e.outcome as Outcome) || "OK";
    by_outcome[outcome] = (by_outcome[outcome] || 0) + 1;

    if (typeof e.reason === "string") {
      by_denial_reason[e.reason] = (by_denial_reason[e.reason] || 0) + 1;
    }
  });

  const summary: IntegritySummary = {
    total_events: redactedEvents.length,
    by_outcome,
    by_denial_reason,
    cursor_continuity: "UNKNOWN", // Continuity check is computationally expensive for large bundles
  };

  // 4. Strip secrets from gateway snapshot
  const redactedSnapshot = params.gatewaySnapshot
    ? redactGatewaySnapshot(params.gatewaySnapshot)
    : undefined;

  return {
    metadata: {
      schema_version: "1.1.0",
      generated_at: new Date().toISOString(),
      source: {
        dashboard_version: params.dashboardVersion,
        gateway_version: params.gatewaySnapshot?.version,
      },
      filters_applied: params.filters,
      cursor_range: params.cursorRange,
      redaction_level: level,
    },
    events: redactedEvents,
    integrity_summary: summary,
    gateway_snapshot: redactedSnapshot,
  };
}
