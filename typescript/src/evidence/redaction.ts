// typescript/src/evidence/redaction.ts

import { AuditEvent, GatewayStatus } from "./bundle.js";

export type RedactionLevel = "none" | "safe_default" | "strict";

export function redactEvent(
  event: AuditEvent,
  level: RedactionLevel
): AuditEvent {
    if (level === "none") return event;

    const copy = structuredClone(event); // Deep copy

    // Common redactions for safe_default
    if (level === "safe_default" || level === "strict") {
        if (copy.request && typeof copy.request === 'object') {
            const req = copy.request as any;
            if (req.headers) {
                // Strip auth headers
                delete req.headers['authorization'];
                delete req.headers['cookie'];
                delete req.headers['x-api-key'];
            }
        }
    }

    if (level === "strict") {
        // Strict redaction - strip all headers? or more aggressive?
        // For now, let's say strict strips inputs entirely
        if (copy.input) {
            copy.input = "[REDACTED]";
        }
        if (copy.request && typeof copy.request === 'object') {
             const req = copy.request as any;
             req.headers = undefined; // Remove all headers
        }
    }

    return copy;
}

export function redactGatewaySnapshot(
  snapshot: GatewayStatus
): Partial<GatewayStatus> {
    const copy = { ...snapshot };
    
    // Always strip these
    delete copy.internal_endpoints;
    delete copy.keys;
    delete copy.tokens;
    
    return copy;
}
