// src/domain/logic/continuity.ts
// Cursor continuity checking

import { compareCursor } from "./cursor.js";
import type {
  CursorGap,
  ContinuityCheckResult,
} from "../types/bundle.types.js";

/**
 * Check cursor continuity based on contract-defined rules.
 * Gap detection requires cursor predecessor relation, not heuristics.
 * For v1.1, we verify strict ordering.
 */
export function checkCursorContinuity(
  events: Array<{ cursor: string; timestamp: number }>,
  _expectedPredecessor?: (cursor: string) => string | null,
): ContinuityCheckResult {
  if (events.length <= 1) {
    return { status: "CONTINUOUS", gaps: [] };
  }

  const gaps: CursorGap[] = [];

  // Verify ordering
  for (let i = 0; i < events.length - 1; i++) {
    const current = events[i];
    const next = events[i + 1];

    // If next cursor is Lexicographically smaller than current, strict ordering violation
    const cmp = compareCursor(current.cursor, next.cursor);
    if (cmp === 1) {
      // Order violation isn't exactly a "gap" but a "discontinuity"
      // For v1.1, we treat this as a Gap for the sake of the interface
      gaps.push({
        from_cursor: current.cursor,
        to_cursor: next.cursor,
        detected_at: Date.now(),
      });
    }
  }

  // FUTURE(v1.2): Implement actual rigorous predecessor check using Merkle links if available
  // For now, we only check monotonic ordering.

  if (gaps.length > 0) {
    return { status: "GAP_DETECTED", gaps };
  }

  return { status: "CONTINUOUS", gaps: [] };
}
