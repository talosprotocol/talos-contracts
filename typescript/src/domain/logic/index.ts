// src/domain/logic/index.ts
// Barrel export for domain logic

export {
  deriveCursor,
  decodeCursor,
  compareCursor,
  assertCursorInvariant,
} from "./cursor";

export { checkCursorContinuity } from "./continuity";

export { orderingCompare } from "./ordering";

export { redactEvent, redactGatewaySnapshot } from "./redaction";

export { createEvidenceBundle } from "./evidence-bundle";
export type { CreateEvidenceBundleParams } from "./evidence-bundle";
