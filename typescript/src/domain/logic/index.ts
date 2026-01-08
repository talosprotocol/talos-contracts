// src/domain/logic/index.ts
// Barrel export for domain logic

export {
  deriveCursor,
  decodeCursor,
  compareCursor,
  assertCursorInvariant,
} from "./cursor.js";

export { checkCursorContinuity } from "./continuity.js";

export { orderingCompare } from "./ordering.js";

export { redactEvent, redactGatewaySnapshot } from "./redaction.js";

export { createEvidenceBundle } from "./evidence-bundle.js";
export type { CreateEvidenceBundleParams } from "./evidence-bundle.js";
