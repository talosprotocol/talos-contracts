/**
 * Tests for Phase 10 A2A session schemas
 */
import { describe, it, expect, beforeAll } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import * as fs from "fs";
import * as path from "path";

const SCHEMA_DIR = path.join(__dirname, "../../schemas/a2a");
const VECTORS_DIR = path.join(__dirname, "../../test_vectors/a2a");

function loadSchema(name: string) {
  const schemaPath = path.join(SCHEMA_DIR, name);
  return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
}

function loadVectors(name: string) {
  const vectorsPath = path.join(VECTORS_DIR, name);
  return JSON.parse(fs.readFileSync(vectorsPath, "utf-8"));
}

describe("Phase 10 A2A Session Schema Validation", () => {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);

  // Load all Phase 10 schemas
  beforeAll(() => {
    const schemas = [
      "session.schema.json",
      "session_event.schema.json",
      "encrypted_frame.schema.json",
      "group.schema.json",
      "group_event.schema.json",
    ];
    for (const s of schemas) {
      try {
        ajv.addSchema(loadSchema(s));
      } catch (e) {
        // Schema may already be added
      }
    }
  });

  describe("session.schema.json", () => {
    const vectors = loadVectors("session_vectors.json");

    it("should validate valid sessions", () => {
      const validate = ajv.getSchema(
        "https://talosprotocol.com/schemas/a2a/session.schema.json",
      );
      expect(validate).toBeDefined();

      for (const v of vectors.valid_sessions) {
        const valid = validate!(v.input);
        if (!valid) console.error(v.description, validate!.errors);
        expect(valid).toBe(true);
      }
    });

    it("should reject invalid sessions", () => {
      const validate = ajv.getSchema(
        "https://talosprotocol.com/schemas/a2a/session.schema.json",
      );

      for (const v of vectors.invalid_sessions) {
        const valid = validate!(v.input);
        expect(valid).toBe(false);
      }
    });
  });

  describe("session_event.schema.json", () => {
    const vectors = loadVectors("session_vectors.json");

    it("should validate valid session events", () => {
      const validate = ajv.getSchema(
        "https://talosprotocol.com/schemas/a2a/session_event.schema.json",
      );
      expect(validate).toBeDefined();

      for (const v of vectors.valid_session_events) {
        const valid = validate!(v.input);
        if (!valid) console.error(v.description, validate!.errors);
        expect(valid).toBe(true);
      }
    });
  });

  describe("encrypted_frame.schema.json", () => {
    const vectors = loadVectors("session_vectors.json");

    it("should validate valid encrypted frames", () => {
      const validate = ajv.getSchema(
        "https://talosprotocol.com/schemas/a2a/encrypted_frame.schema.json",
      );
      expect(validate).toBeDefined();

      for (const v of vectors.valid_encrypted_frames) {
        const valid = validate!(v.input);
        if (!valid) console.error(v.description, validate!.errors);
        expect(valid).toBe(true);
      }
    });

    it("should reject invalid encrypted frames", () => {
      const validate = ajv.getSchema(
        "https://talosprotocol.com/schemas/a2a/encrypted_frame.schema.json",
      );

      for (const v of vectors.invalid_encrypted_frames) {
        const valid = validate!(v.input);
        expect(valid).toBe(false);
      }
    });
  });

  describe("group.schema.json", () => {
    const vectors = loadVectors("session_vectors.json");

    it("should validate valid groups", () => {
      const validate = ajv.getSchema(
        "https://talosprotocol.com/schemas/a2a/group.schema.json",
      );
      expect(validate).toBeDefined();

      for (const v of vectors.valid_groups) {
        const valid = validate!(v.input);
        if (!valid) console.error(v.description, validate!.errors);
        expect(valid).toBe(true);
      }
    });
  });

  describe("group_event.schema.json", () => {
    const vectors = loadVectors("session_vectors.json");

    it("should validate valid group events", () => {
      const validate = ajv.getSchema(
        "https://talosprotocol.com/schemas/a2a/group_event.schema.json",
      );
      expect(validate).toBeDefined();

      for (const v of vectors.valid_group_events) {
        const valid = validate!(v.input);
        if (!valid) console.error(v.description, validate!.errors);
        expect(valid).toBe(true);
      }
    });
  });
});
