// src/domain/types/index.ts
// Barrel export for domain types

export type {
  CursorValidationReason,
  CursorValidationResult,
  DecodedCursor,
} from "./cursor.types.js";

export type {
  AuditEvent,
  GatewayStatus,
  Outcome,
  RedactionLevel,
  AuditFilters,
  Comparator,
} from "./event.types.js";

export type {
  EvidenceBundleMetadata,
  IntegritySummary,
  EvidenceBundle,
  CursorGap,
  ContinuityCheckResult,
} from "./bundle.types.js";
