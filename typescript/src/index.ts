// typescript/src/index.ts
// Public API exports for @talosprotocol/contracts

// Base64url encoding
export {
    Base64UrlError,
    base64urlEncodeBytes,
    base64urlDecodeToBytes,
    base64urlEncodeUtf8,
    base64urlDecodeToUtf8,
} from "./base64url.js";

// UUIDv7 validation
export { isUuidV7, isCanonicalLowerUuid } from "./uuidv7.js";

// Cursor operations
export {
    deriveCursor,
    decodeCursor,
    compareCursor,
    assertCursorInvariant,
    type CursorValidationReason,
    type CursorValidationResult,
    type DecodedCursor,
} from "./cursor.js";

// Event ordering
export { orderingCompare } from "./ordering.js";
