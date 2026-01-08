// src/domain/index.ts
// Barrel export for domain layer

// Types
export type {
  CursorValidationReason,
  CursorValidationResult,
  DecodedCursor,
  AuditEvent,
  GatewayStatus,
  Outcome,
  RedactionLevel,
  AuditFilters,
  Comparator,
  EvidenceBundleMetadata,
  IntegritySummary,
  EvidenceBundle,
  CursorGap,
  ContinuityCheckResult,
} from "./types/index.js";

// Logic
export {
  deriveCursor,
  decodeCursor,
  compareCursor,
  assertCursorInvariant,
  checkCursorContinuity,
  orderingCompare,
  redactEvent,
  redactGatewaySnapshot,
  createEvidenceBundle,
} from "./logic/index.js";

export type { CreateEvidenceBundleParams } from "./logic/index.js";
