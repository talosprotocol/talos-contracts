// src/domain/logic/cursor.ts
// Cursor derivation, validation, and comparison
// D4=B: invalid frames do not throw from validation, return INVALID_FRAME

import {
  base64urlDecodeToUtf8,
  base64urlEncodeUtf8,
} from "../../infrastructure/base64url";
import { isUuidV7, isCanonicalLowerUuid } from "../../infrastructure/uuidv7";
import type {
  CursorValidationResult,
  DecodedCursor,
} from "../types/cursor.types";

function isValidUnixSecondsInt(n: unknown): n is number {
  return (
    typeof n === "number" &&
    Number.isInteger(n) &&
    n >= 0 &&
    Number.isSafeInteger(n)
  );
}

function isCanonicalTimestampString(s: string): boolean {
  if (!/^\d+$/.test(s)) return false;
  if (s.length > 1 && s.startsWith("0")) return false;
  return true;
}

/**
 * Derive a cursor from timestamp and event_id.
 * cursor = base64url(utf8("{timestamp}:{event_id}"))
 */
export function deriveCursor(timestamp: number, eventId: string): string {
  if (!isValidUnixSecondsInt(timestamp)) {
    throw new Error("timestamp must be unix seconds integer");
  }
  const plain = `${String(timestamp)}:${eventId}`;
  return base64urlEncodeUtf8(plain);
}

/**
 * Decode a cursor to {timestamp, event_id}.
 * Throws on invalid cursor format.
 */
export function decodeCursor(cursor: string): DecodedCursor {
  const raw = base64urlDecodeToUtf8(cursor);
  const colonIndex = raw.indexOf(":");
  if (colonIndex === -1)
    throw new Error("cursor frame must be '{timestamp}:{event_id}'");

  const tsStr = raw.slice(0, colonIndex);
  const eventId = raw.slice(colonIndex + 1);

  if (!isCanonicalTimestampString(tsStr))
    throw new Error("timestamp is not canonical base-10");
  const tsNum = Number(tsStr);
  if (!isValidUnixSecondsInt(tsNum))
    throw new Error("timestamp is out of range");

  if (!isUuidV7(eventId)) throw new Error("event_id is not uuidv7");
  if (!isCanonicalLowerUuid(eventId))
    throw new Error("event_id must be lowercase canonical uuid");

  return { timestamp: tsNum, event_id: eventId };
}

/**
 * Compare two cursors.
 * Returns -1 if a < b, 0 if equal, 1 if a > b.
 * Compares by (timestamp, event_id) lexicographically.
 */
export function compareCursor(a: string, b: string): -1 | 0 | 1 {
  const da = decodeCursor(a);
  const db = decodeCursor(b);

  if (da.timestamp < db.timestamp) return -1;
  if (da.timestamp > db.timestamp) return 1;

  if (da.event_id < db.event_id) return -1;
  if (da.event_id > db.event_id) return 1;
  return 0;
}

/**
 * Validate that an event's cursor matches the derived cursor.
 * D4=B: Does not throw on invalid frames, returns { ok: false, reason: "INVALID_FRAME" }
 */
export function assertCursorInvariant(event: {
  timestamp: unknown;
  event_id: unknown;
  cursor: unknown;
}): CursorValidationResult {
  // Frame checks first (D4=B: do not throw)
  if (
    !isValidUnixSecondsInt(event.timestamp) ||
    typeof event.event_id !== "string" ||
    typeof event.cursor !== "string"
  ) {
    return { ok: false, derived: "", reason: "INVALID_FRAME" };
  }

  // Decode cursor must be strict base64url + canonical frame. If it fails, INVALID_FRAME.
  try {
    decodeCursor(event.cursor);
  } catch {
    const derived = deriveCursor(event.timestamp, event.event_id);
    return { ok: false, derived, reason: "INVALID_FRAME" };
  }

  // Derived cursor must match exactly (CURSOR_MISMATCH)
  const derived = deriveCursor(event.timestamp, event.event_id);
  if (event.cursor !== derived)
    return { ok: false, derived, reason: "CURSOR_MISMATCH" };

  // Also enforce event_id canonical uuidv7 for the event frame
  if (!isUuidV7(event.event_id) || !isCanonicalLowerUuid(event.event_id)) {
    return { ok: false, derived, reason: "INVALID_FRAME" };
  }

  return { ok: true, derived };
}
