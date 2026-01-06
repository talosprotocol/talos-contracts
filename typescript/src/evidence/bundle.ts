// typescript/src/evidence/bundle.ts

import { compareCursor } from "../cursor/index.js";
import { redactEvent, redactGatewaySnapshot, RedactionLevel } from "./redaction.js";

// We need a way to reference AuditEvent. Since we don't have a shared library for just the types yet 
// (or they might be in schemas), we will define a generic interface or rely on 'any' for the type payload if not available.
// However, the dashboard has `AuditEvent`. Let's assume a generic shape that has `cursor` and `event_id`.
// Actually, strict typing is better.
// Assuming AuditEvent is passed in or defined here.
export interface AuditEvent {
    event_id: string;
    timestamp: number;
    cursor: string;
    [key: string]: unknown;
}

export interface GatewayStatus {
    version: string;
    internal_endpoints?: string[];
    keys?: Record<string, string>;
    tokens?: Record<string, string>;
    [key: string]: unknown;
}

export interface AuditFilters {
    [key: string]: unknown;
}

export interface Comparator<T> {
    (a: T, b: T): -1 | 0 | 1;
}

export interface EvidenceBundleMetadata {
    schema_version: string;
    generated_at: string; // ISO 8601
    source: {
        dashboard_version: string;
        gateway_version?: string;
    };
    filters_applied?: AuditFilters;
    cursor_range?: { start?: string; end?: string };
    redaction_level: RedactionLevel;
}

export interface IntegritySummary {
    total_events: number;
    by_outcome: Record<"OK" | "DENY" | "ERROR", number>;
    by_denial_reason: Record<string, number>;
    cursor_continuity: "VERIFIED" | "GAPS_DETECTED" | "UNKNOWN";
}

export interface EvidenceBundle {
    metadata: EvidenceBundleMetadata;
    events: AuditEvent[]; // Sorted by cursor (contract-defined order)
    integrity_summary: IntegritySummary;
    gateway_snapshot?: Partial<GatewayStatus>; // Secrets stripped
}

export function createEvidenceBundle(params: {
    events: AuditEvent[];
    redactionLevel?: RedactionLevel;
    gatewaySnapshot?: GatewayStatus;
    filters?: AuditFilters;
    cursorRange?: { start?: string; end?: string };
    dashboardVersion: string;
}): EvidenceBundle {
    const level = params.redactionLevel ?? "safe_default";

    // 1. Sort events by cursor (canonical order)
    const sortedEvents = [...params.events].sort((a, b) => compareCursor(a.cursor, b.cursor));

    // 2. Apply redaction based on level
    const redactedEvents = sortedEvents.map(e => redactEvent(e, level));

    // 3. Compute integrity summary
    const by_outcome: Record<"OK" | "DENY" | "ERROR", number> = { OK: 0, DENY: 0, ERROR: 0 };
    const by_denial_reason: Record<string, number> = {};

    redactedEvents.forEach(e => {
        const outcome = (e.outcome as "OK" | "DENY" | "ERROR") || "OK";
        by_outcome[outcome] = (by_outcome[outcome] || 0) + 1;
        
        if (typeof e.reason === 'string') {
            by_denial_reason[e.reason] = (by_denial_reason[e.reason] || 0) + 1;
        }
    });

    const summary: IntegritySummary = {
        total_events: redactedEvents.length,
        by_outcome,
        by_denial_reason,
        cursor_continuity: "UNKNOWN" // TODO: Hook up continuity check
    };

    // 4. Strip secrets from gateway snapshot
    const redactedSnapshot = params.gatewaySnapshot ? redactGatewaySnapshot(params.gatewaySnapshot) : undefined;

    return {
        metadata: {
            schema_version: "1.1.0",
            generated_at: new Date().toISOString(),
            source: {
                dashboard_version: params.dashboardVersion,
                gateway_version: params.gatewaySnapshot?.version
            },
            filters_applied: params.filters,
            cursor_range: params.cursorRange,
            redaction_level: level
        },
        events: redactedEvents,
        integrity_summary: summary,
        gateway_snapshot: redactedSnapshot
    };
}
