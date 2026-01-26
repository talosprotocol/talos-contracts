// src/domain/logic/redaction.ts
// Event and gateway snapshot redaction

import type {
  AuditEvent,
  GatewayStatus,
  RedactionLevel,
} from "../types/event.types";

export function redactEvent(
  event: AuditEvent,
  level: RedactionLevel,
): AuditEvent {
  if (level === "none") return event;

  const copy = structuredClone(event); // Deep copy

  // Common redactions for safe_default
  if (level === "safe_default" || level === "strict") {
    if (copy.request && typeof copy.request === "object") {
      const req = copy.request as {
        headers?: Record<string, string>;
        [key: string]: unknown;
      };
      if (req.headers) {
        // Strip auth headers
        delete req.headers["authorization"];
        delete req.headers["cookie"];
        delete req.headers["x-api-key"];
      }
    }
  }

  if (level === "strict") {
    // Strict redaction - strip inputs and all headers
    if (copy.input) {
      copy.input = "[REDACTED]";
    }
    if (copy.request && typeof copy.request === "object") {
      const req = copy.request as {
        headers?: Record<string, string>;
        [key: string]: unknown;
      };
      req.headers = undefined; // Remove all headers
    }
  }

  return copy;
}

export function redactGatewaySnapshot(
  snapshot: GatewayStatus,
): Partial<GatewayStatus> {
  const copy = { ...snapshot };

  // Always strip these
  delete copy.internal_endpoints;
  delete copy.keys;
  delete copy.tokens;

  return copy;
}
