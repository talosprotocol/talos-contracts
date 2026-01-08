// src/domain/types/bundle.types.ts
// Evidence bundle and continuity type definitions

import type {
  AuditEvent,
  AuditFilters,
  Outcome,
  RedactionLevel,
} from "./event.types.js";

export interface EvidenceBundleMetadata {
  schema_version: string;
  generated_at: string; // ISO 8601
  source: {
    dashboard_version: string;
    gateway_version?: string;
  };
  filters_applied?: AuditFilters;
  cursor_range?: { start?: string; end?: string };
  redaction_level: RedactionLevel;
}

export interface IntegritySummary {
  total_events: number;
  by_outcome: Record<Outcome, number>;
  by_denial_reason: Record<string, number>;
  cursor_continuity: "VERIFIED" | "GAPS_DETECTED" | "UNKNOWN";
}

export interface EvidenceBundle {
  metadata: EvidenceBundleMetadata;
  events: AuditEvent[]; // Sorted by cursor (contract-defined order)
  integrity_summary: IntegritySummary;
  gateway_snapshot?: Partial<GatewayStatus>;
}

export interface CursorGap {
  from_cursor: string;
  to_cursor: string;
  expected_events?: number; // If known from metadata
  detected_at: number;
}

export interface ContinuityCheckResult {
  status: "CONTINUOUS" | "GAP_DETECTED" | "UNKNOWN";
  gaps: CursorGap[];
}

// Re-export for convenience (needed by EvidenceBundle)
import type { GatewayStatus } from "./event.types.js";
export type { GatewayStatus };
