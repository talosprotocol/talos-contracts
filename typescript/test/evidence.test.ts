import { describe, it } from 'vitest';
import { assert } from "chai";
import { 
    createEvidenceBundle, 
    deriveCursor, 
    AuditEvent, 
    checkCursorContinuity
} from "../src/index.js";

function makeEvent(ts: number, id: string, extra: Record<string, unknown> = {}): AuditEvent {
    // Generate valid cursor
    const cursor = deriveCursor(ts, id);
    return {
        id,
        event_id: id,
        timestamp: ts,
        cursor,
        ...extra
    };
}

// Canonical UUIDv7-like strings for testing (lexicographically sortable)
const ID_1 = "018e0a0a-0000-7000-8000-000000000001";
const ID_2 = "018e0a0a-0000-7000-8000-000000000002";
const ID_3 = "018e0a0a-0000-7000-8000-000000000003";

describe("Evidence Bundle", () => {
    describe("createEvidenceBundle", () => {
        it("sorts events deterministically by cursor", () => {
            const e1 = makeEvent(1000, ID_1);
            const e2 = makeEvent(2000, ID_2); // Later timestamp
            const e3 = makeEvent(1000, ID_3); // Same timestamp as e1, but higher ID

            // Input shuffled
            const bundle = createEvidenceBundle({
                events: [e2, e3, e1],
                dashboardVersion: "1.0.0"
            });

            assert.strictEqual(bundle.events.length, 3);
            assert.strictEqual(bundle.events[0].id, ID_1);
            assert.strictEqual(bundle.events[1].id, ID_3); // ID tiebreak
            assert.strictEqual(bundle.events[2].id, ID_2);
        });

        it("computes integrity summary correctly", () => {
             const e1 = makeEvent(1000, ID_1, { outcome: "OK" });
             const e2 = makeEvent(1001, ID_2, { outcome: "DENY", reason: "Policy A" });
             const e3 = makeEvent(1002, ID_3, { outcome: "DENY", reason: "Policy A" });

             const bundle = createEvidenceBundle({
                 events: [e1, e2, e3],
                 dashboardVersion: "1.0.0"
             });

             assert.equal(bundle.integrity_summary.total_events, 3);
             assert.equal(bundle.integrity_summary.by_outcome.OK, 1);
             assert.equal(bundle.integrity_summary.by_outcome.DENY, 2);
             assert.equal(bundle.integrity_summary.by_denial_reason["Policy A"], 2);
        });

        it("applies redaction defaults", () => {
            const e1 = makeEvent(1000, ID_1, { 
                input: "secret",
                request: { 
                    headers: { 
                        "authorization": "Bearer xyz",
                        "x-api-key": "123",
                        "content-type": "application/json"
                    }
                }
            });

            // Default is safe_default
            const bundle = createEvidenceBundle({
                events: [e1],
                dashboardVersion: "1.0.0"
            });

            const redacted = bundle.events[0] as any;
            
            // Should Redact sensitive headers
            assert.isUndefined(redacted.request.headers.authorization);
            assert.isUndefined(redacted.request.headers["x-api-key"]);
            
            // Should Keep safe headers
            assert.equal(redacted.request.headers["content-type"], "application/json");
            
            // Should Keep input in safe_default
            assert.equal(redacted.input, "secret");
        });

        it("handles strict redaction", () => {
             const e1 = makeEvent(1000, ID_1, { input: "secret" });
             const bundle = createEvidenceBundle({
                 events: [e1],
                 dashboardVersion: "1.0.0",
                 redactionLevel: "strict"
             });
             
             assert.equal((bundle.events[0] as any).input, "[REDACTED]");
        });
    });

    describe("checkCursorContinuity", () => {
        it("detects gaps (ordering violation)", () => {
             const e1 = { cursor: deriveCursor(1000, ID_1), timestamp: 1000 };
             const e2 = { cursor: deriveCursor(2000, ID_2), timestamp: 2000 };
             
             // e2 provided BEFORE e1 in the list => Violation
             const result = checkCursorContinuity([e2, e1]);
             
             assert.equal(result.status, "GAP_DETECTED");
             assert.equal(result.gaps.length, 1);
        });

        it("verifies continuous sequence", () => {
             const e1 = { cursor: deriveCursor(1000, ID_1), timestamp: 1000 };
             const e2 = { cursor: deriveCursor(2000, ID_2), timestamp: 2000 };
             
             const result = checkCursorContinuity([e1, e2]);
             
             assert.equal(result.status, "CONTINUOUS");
             assert.equal(result.gaps.length, 0);
        });
    });
});
