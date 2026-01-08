// src/domain/types/event.types.ts
// Core event and gateway type definitions

export interface AuditEvent {
  event_id: string;
  timestamp: number;
  cursor: string;
  outcome?: Outcome;
  reason?: string;
  input?: unknown;
  request?: {
    headers?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface GatewayStatus {
  version: string;
  internal_endpoints?: string[];
  keys?: Record<string, string>;
  tokens?: Record<string, string>;
  [key: string]: unknown;
}

export type Outcome = "OK" | "DENY" | "ERROR";

export type RedactionLevel = "none" | "safe_default" | "strict";

export interface AuditFilters {
  [key: string]: unknown;
}

export type Comparator<T> = (a: T, b: T) => -1 | 0 | 1;
