/**
 * Tests for TGA state machine schemas (Phase 9.3)
 */
import { describe, it, expect } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import * as fs from "fs";
import * as path from "path";

const SCHEMA_DIR = path.join(__dirname, "../../schemas/tga/v1");
const VECTORS_DIR = path.join(__dirname, "../../test_vectors/tga");

function loadSchema(name: string) {
  const schemaPath = path.join(SCHEMA_DIR, name);
  return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
}

describe("TGA State Machine Schema Validation (Phase 9.3)", () => {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);

  describe("execution_log_entry.schema.json", () => {
    const schema = loadSchema("execution_log_entry.schema.json");
    const validate = ajv.compile(schema);

    it("should validate a valid genesis log entry", () => {
      const entry = {
        schema_id: "talos.tga.execution_log_entry",
        schema_version: "v1",
        trace_id: "01936a8b-4c2d-7000-8000-000000000001",
        sequence_number: 1,
        prev_entry_digest:
          "0000000000000000000000000000000000000000000000000000000000000000",
        entry_digest:
          "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        ts: "2026-01-15T19:00:00.000Z",
        from_state: "PENDING",
        to_state: "PENDING",
        artifact_type: "action_request",
        artifact_id: "01936a8b-4c2d-7000-8000-000000000002",
        artifact_digest:
          "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
        tool_call_id: null,
        idempotency_key: null,
      };
      expect(validate(entry)).toBe(true);
    });

    it("should validate a tool_call entry with idempotency_key", () => {
      const entry = {
        schema_id: "talos.tga.execution_log_entry",
        schema_version: "v1",
        trace_id: "01936a8b-4c2d-7000-8000-000000000001",
        sequence_number: 3,
        prev_entry_digest:
          "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        entry_digest:
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        ts: "2026-01-15T19:00:02.000Z",
        from_state: "AUTHORIZED",
        to_state: "EXECUTING",
        artifact_type: "tool_call",
        artifact_id: "01936a8b-4c2d-7000-8000-000000000003",
        artifact_digest:
          "aaaa567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        tool_call_id: "01936a8b-4c2d-7000-8000-000000000003",
        idempotency_key: "idem-key-123",
      };
      expect(validate(entry)).toBe(true);
    });

    it("should reject invalid state", () => {
      const entry = {
        schema_id: "talos.tga.execution_log_entry",
        schema_version: "v1",
        trace_id: "01936a8b-4c2d-7000-8000-000000000001",
        sequence_number: 1,
        prev_entry_digest:
          "0000000000000000000000000000000000000000000000000000000000000000",
        entry_digest:
          "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        ts: "2026-01-15T19:00:00.000Z",
        from_state: "INVALID_STATE",
        to_state: "PENDING",
        artifact_type: "action_request",
        artifact_id: "01936a8b-4c2d-7000-8000-000000000002",
        artifact_digest:
          "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
      };
      expect(validate(entry)).toBe(false);
    });

    it("should reject non-lowercase digest", () => {
      const entry = {
        schema_id: "talos.tga.execution_log_entry",
        schema_version: "v1",
        trace_id: "01936a8b-4c2d-7000-8000-000000000001",
        sequence_number: 1,
        prev_entry_digest:
          "ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789",
        entry_digest:
          "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        ts: "2026-01-15T19:00:00.000Z",
        from_state: "PENDING",
        to_state: "PENDING",
        artifact_type: "action_request",
        artifact_id: "01936a8b-4c2d-7000-8000-000000000002",
        artifact_digest:
          "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
      };
      expect(validate(entry)).toBe(false);
    });
  });

  describe("execution_state.schema.json", () => {
    const schema = loadSchema("execution_state.schema.json");
    const validate = ajv.compile(schema);

    it("should validate a valid execution state", () => {
      const state = {
        schema_id: "talos.tga.execution_state",
        schema_version: "v1",
        trace_id: "01936a8b-4c2d-7000-8000-000000000001",
        plan_id: "01936a8b-4c2d-7000-8000-000000000010",
        current_state: "EXECUTING",
        last_sequence_number: 3,
        last_entry_digest:
          "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        state_digest:
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(validate(state)).toBe(true);
    });

    it("should validate empty state (sequence 0)", () => {
      const state = {
        schema_id: "talos.tga.execution_state",
        schema_version: "v1",
        trace_id: "01936a8b-4c2d-7000-8000-000000000001",
        plan_id: "01936a8b-4c2d-7000-8000-000000000010",
        current_state: "PENDING",
        last_sequence_number: 0,
        last_entry_digest:
          "0000000000000000000000000000000000000000000000000000000000000000",
        state_digest:
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      };
      expect(validate(state)).toBe(true);
    });
  });

  describe("execution_checkpoint.schema.json", () => {
    const schema = loadSchema("execution_checkpoint.schema.json");
    const validate = ajv.compile(schema);

    it("should validate a valid checkpoint", () => {
      const checkpoint = {
        schema_id: "talos.tga.execution_checkpoint",
        schema_version: "v1",
        trace_id: "01936a8b-4c2d-7000-8000-000000000001",
        checkpoint_sequence_number: 4,
        checkpoint_state: {
          trace_id: "01936a8b-4c2d-7000-8000-000000000001",
          plan_id: "01936a8b-4c2d-7000-8000-000000000010",
          current_state: "COMPLETED",
          last_sequence_number: 4,
          last_entry_digest:
            "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        },
        checkpoint_digest:
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        ts: "2026-01-15T19:00:05.000Z",
      };
      expect(validate(checkpoint)).toBe(true);
    });
  });
});
