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
} from "./types/index";

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
} from "./logic/index";

export type { CreateEvidenceBundleParams } from "./logic/index";
