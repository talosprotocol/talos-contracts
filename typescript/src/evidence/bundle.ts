// typescript/src/evidence/bundle.ts
// @deprecated - Import from package root instead. Deep imports are unsupported.
// This file exists for internal migration compatibility and will be removed in v2.0.

/**
 * @deprecated Import from '@talosprotocol/contracts' root instead.
 */
export { createEvidenceBundle } from "../domain/logic/evidence-bundle.js";

export type {
  AuditEvent,
  GatewayStatus,
  RedactionLevel,
} from "../domain/types/event.types.js";

export type {
  EvidenceBundle,
  EvidenceBundleMetadata,
  IntegritySummary,
} from "../domain/types/bundle.types.js";
