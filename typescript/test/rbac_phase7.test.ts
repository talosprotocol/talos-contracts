/**
 * Tests for Phase 7 RBAC schemas
 */
import { describe, it, expect } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import * as fs from "fs";
import * as path from "path";

const SCHEMA_DIR = path.join(__dirname, "../../schemas/rbac");
const VECTORS_DIR = path.join(__dirname, "../../test_vectors/rbac");

function loadSchema(dir: string, name: string) {
  const schemaPath = path.join(dir, name);
  return JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
}

function loadVectors(name: string) {
  const vectorsPath = path.join(VECTORS_DIR, name);
  return JSON.parse(fs.readFileSync(vectorsPath, "utf-8"));
}

describe("Phase 7 RBAC Schema Validation", () => {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);

  describe("binding.schema.json", () => {
    const schema = loadSchema(SCHEMA_DIR, "binding.schema.json");
    const validate = ajv.compile(schema);

    it("should validate a valid binding document", () => {
      const binding = {
        schema_id: "talos.rbac.binding",
        schema_version: "v1",
        principal_id: "user_123",
        bindings: [
          {
            binding_id: "bind_001",
            role_id: "role_admin",
            scope: {
              scope_type: "repo",
              attributes: { repo: "talosprotocol/talos" },
            },
          },
        ],
      };
      expect(validate(binding)).toBe(true);
    });

    it("should validate binding with team_id", () => {
      const binding = {
        schema_id: "talos.rbac.binding",
        schema_version: "v1",
        principal_id: "user_123",
        team_id: "team_abc",
        bindings: [
          {
            binding_id: "bind_002",
            role_id: "role_viewer",
            scope: {
              scope_type: "global",
              attributes: {},
            },
          },
        ],
      };
      expect(validate(binding)).toBe(true);
    });

    it("should reject missing principal_id", () => {
      const binding = {
        schema_id: "talos.rbac.binding",
        schema_version: "v1",
        bindings: [],
      };
      expect(validate(binding)).toBe(false);
    });

    it("should reject invalid scope_type", () => {
      const binding = {
        schema_id: "talos.rbac.binding",
        schema_version: "v1",
        principal_id: "user_123",
        bindings: [
          {
            binding_id: "bind_001",
            role_id: "role_admin",
            scope: {
              scope_type: "invalid_type",
              attributes: {},
            },
          },
        ],
      };
      expect(validate(binding)).toBe(false);
    });
  });

  describe("surface_registry.schema.json", () => {
    const schema = loadSchema(
      path.join(__dirname, "../../schemas/gateway"),
      "surface_registry.schema.json",
    );
    const validate = ajv.compile(schema);

    it("should validate a valid surface registry", () => {
      const registry = {
        schema_id: "talos.gateway.surface_registry",
        schema_version: "v1",
        routes: [
          {
            method: "GET",
            path_template: "/v1/secrets/{secret_id}",
            permission: "secrets.read",
            scope_template: {
              scope_type: "secret",
              attributes: { secret_id: "{secret_id}" },
            },
          },
          {
            method: "POST",
            path_template: "/v1/secrets",
            permission: "secrets.write",
            scope_template: {
              scope_type: "global",
              attributes: {},
            },
          },
        ],
      };
      expect(validate(registry)).toBe(true);
    });

    it("should reject invalid HTTP method", () => {
      const registry = {
        schema_id: "talos.gateway.surface_registry",
        schema_version: "v1",
        routes: [
          {
            method: "INVALID",
            path_template: "/v1/test",
            permission: "test.read",
            scope_template: { scope_type: "global", attributes: {} },
          },
        ],
      };
      expect(validate(registry)).toBe(false);
    });

    it("should reject path not starting with /", () => {
      const registry = {
        schema_id: "talos.gateway.surface_registry",
        schema_version: "v1",
        routes: [
          {
            method: "GET",
            path_template: "v1/test",
            permission: "test.read",
            scope_template: { scope_type: "global", attributes: {} },
          },
        ],
      };
      expect(validate(registry)).toBe(false);
    });
  });

  describe("scope_match_vectors.json", () => {
    const vectors = loadVectors("scope_match_vectors.json");

    it("should have valid match cases", () => {
      expect(vectors.valid_matches.length).toBeGreaterThan(0);
      for (const c of vectors.valid_matches) {
        expect(c.expected.matched).toBe(true);
        expect(c.expected.specificity).toBeGreaterThanOrEqual(0);
      }
    });

    it("should have invalid match cases", () => {
      expect(vectors.invalid_matches.length).toBeGreaterThan(0);
      for (const c of vectors.invalid_matches) {
        expect(c.expected.matched).toBe(false);
        expect(c.expected.reason).toBeDefined();
      }
    });

    it("should have tie-break cases", () => {
      expect(vectors.tie_break_cases.length).toBeGreaterThan(0);
      for (const c of vectors.tie_break_cases) {
        expect(c.expected_winner).toBeDefined();
        expect(c.reason).toBeDefined();
      }
    });
  });
});
