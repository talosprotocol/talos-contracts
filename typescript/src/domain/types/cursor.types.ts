// src/domain/types/cursor.types.ts
// Cursor-related type definitions

export type CursorValidationReason = "CURSOR_MISMATCH" | "INVALID_FRAME";

export type CursorValidationResult =
  | { ok: true; derived: string }
  | { ok: false; derived: string; reason: CursorValidationReason };

export type DecodedCursor = { timestamp: number; event_id: string };
