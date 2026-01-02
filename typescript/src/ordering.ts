// typescript/src/ordering.ts
// Event ordering comparison: (timestamp DESC, event_id DESC)

/**
 * Compare two events for ordering.
 * Returns -1 if a should come before b (a is "greater" in DESC order)
 * Returns 0 if equal
 * Returns 1 if a should come after b
 * 
 * Ordering: timestamp DESC, then event_id DESC
 */
export function orderingCompare(
    a: { timestamp: number; event_id: string },
    b: { timestamp: number; event_id: string }
): -1 | 0 | 1 {
    // DESC timestamp: higher timestamp comes first
    if (a.timestamp > b.timestamp) return -1;
    if (a.timestamp < b.timestamp) return 1;

    // DESC event_id: higher event_id comes first (lexicographic)
    if (a.event_id > b.event_id) return -1;
    if (a.event_id < b.event_id) return 1;
    return 0;
}
