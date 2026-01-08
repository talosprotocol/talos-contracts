// typescript/src/cursor/index.ts
// @deprecated - Import from package root instead. Deep imports are unsupported.
// This file exists for internal migration compatibility and will be removed in v2.0.

/**
 * @deprecated Import from '@talosprotocol/contracts' root instead.
 */
export {
  deriveCursor,
  decodeCursor,
  compareCursor,
  assertCursorInvariant,
} from "../domain/logic/cursor.js";

export type {
  CursorValidationReason,
  CursorValidationResult,
  DecodedCursor,
} from "../domain/types/cursor.types.js";
