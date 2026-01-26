// typescript/src/index.ts
// Public API exports for @talosprotocol/contracts
//
// This file is the ONLY supported import path for this package.
// All exports are stable and backward-compatible.

// ============================================================================
// Infrastructure: Encoding & Validation Utilities
// ============================================================================

export {
  Base64UrlError,
  base64urlEncodeBytes,
  base64urlDecodeToBytes,
  base64urlEncodeUtf8,
  base64urlDecodeToUtf8,
} from "./infrastructure/base64url";

export { isUuidV7, isCanonicalLowerUuid } from "./infrastructure/uuidv7";

// ============================================================================
// Domain Types
// ============================================================================

// Cursor types
export type {
  CursorValidationReason,
  CursorValidationResult,
  DecodedCursor,
} from "./domain/types/cursor.types";

// Event types
export type {
  AuditEvent,
  GatewayStatus,
  Outcome,
  RedactionLevel,
  AuditFilters,
  Comparator,
} from "./domain/types/event.types";

// Bundle types
export type {
  EvidenceBundleMetadata,
  IntegritySummary,
  EvidenceBundle,
  CursorGap,
  ContinuityCheckResult,
} from "./domain/types/bundle.types";

// ============================================================================
// Domain Logic
// ============================================================================

// Cursor operations
export {
  deriveCursor,
  decodeCursor,
  compareCursor,
  assertCursorInvariant,
} from "./domain/logic/cursor";

// Continuity checking
export { checkCursorContinuity } from "./domain/logic/continuity";

// Event ordering
export { orderingCompare } from "./domain/logic/ordering";

// Redaction
export {
  redactEvent,
  redactGatewaySnapshot,
} from "./domain/logic/redaction";

// Evidence bundle creation
export { createEvidenceBundle } from "./domain/logic/evidence-bundle";

export const VERSION = "1.2.0";
