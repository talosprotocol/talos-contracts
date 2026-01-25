import { describe, expect, test } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

// Add support for Draft 7 used by some shared schemas
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json" assert { type: "json" };
ajv.addMetaSchema(draft7MetaSchema);

function readJson(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const schemasTgaDir = path.resolve(__dirname, "../../schemas/tga/v1");
const schemasCommonDir = path.resolve(__dirname, "../../schemas/common");
const vectorsDir = path.resolve(__dirname, "../../test_vectors/tga/v1");

describe("TGA v1 Schema Validation (Hardened)", () => {
  // Load Common schemas
  const commonSchemas = ["uuidv7.schema.json", "errors.schema.json"];
  for (const s of commonSchemas) {
    const schema = readJson(path.join(schemasCommonDir, s));
    if (!ajv.getSchema(schema.$id)) {
      ajv.addSchema(schema);
    }
  }

  // Load TGA v1 schemas
  const tgaIndex = readJson(path.join(schemasTgaDir, "index.json"));
  for (const s of tgaIndex.schemas) {
    const schema = readJson(path.join(schemasTgaDir, s));
    if (!ajv.getSchema(schema.$id)) {
      ajv.addSchema(schema);
    }
  }

  describe("TGA v1 Tool Vectors", () => {
    const v1Tools = [
      "authorize_allow",
      "authorize_session_cache_hit",
      "authorize_deny_invalid_signature",
      "authorize_deny_expired",
      "authorize_deny_constraint_mismatch_server",
      "authorize_deny_constraint_mismatch_args",
      "log_redaction",
      "recover_divergence"
    ];

    for (const tool of v1Tools) {
      test(`validate ${tool} vector`, () => {
        const vector = readJson<any>(path.join(vectorsDir, `${tool}.json`));
        
        // Validate input against request schema if it's an authorize/log/recover call
        if (tool.startsWith("authorize")) {
          const schemaId = "https://talosprotocol.com/schemas/tga/v1/governance.authorize.v1.request.schema.json";
          const validate = ajv.getSchema(schemaId);
          if (!validate) throw new Error(`Schema ${schemaId} not found`);
          
          if (vector.input) {
            const valid = validate(vector.input);
            if (!valid) console.error(`Validation failed for ${tool} input:`, validate.errors);
            expect(valid).toBe(true);
          }
        } else if (tool.startsWith("log")) {
          const schemaId = "https://talosprotocol.com/schemas/tga/v1/governance.log.v1.request.schema.json";
          const validate = ajv.getSchema(schemaId);
          if (!validate) throw new Error(`Schema ${schemaId} not found`);
          
          if (vector.input) {
            const valid = validate(vector.input);
            if (!valid) console.error(`Validation failed for ${tool} input:`, validate.errors);
            expect(valid).toBe(true);
          }
        } else if (tool.startsWith("recover")) {
          const schemaId = "https://talosprotocol.com/schemas/tga/v1/governance.recover.v1.request.schema.json";
          const validate = ajv.getSchema(schemaId);
          if (!validate) throw new Error(`Schema ${schemaId} not found`);
          
          if (vector.input) {
            const valid = validate(vector.input);
            if (!valid) console.error(`Validation failed for ${tool} input:`, validate.errors);
            expect(valid).toBe(true);
          }
        }

        // Validate expected against response schema
        let responseSchemaId: string | undefined;
        if (tool.startsWith("authorize")) {
          responseSchemaId = "https://talosprotocol.com/schemas/tga/v1/governance.authorize.v1.response.schema.json";
        } else if (tool.startsWith("log")) {
          responseSchemaId = "https://talosprotocol.com/schemas/tga/v1/governance.log.v1.response.schema.json";
        } else if (tool.startsWith("recover")) {
          responseSchemaId = "https://talosprotocol.com/schemas/tga/v1/governance.recover.v1.response.schema.json";
        }

        if (responseSchemaId) {
          const validateResponse = ajv.getSchema(responseSchemaId);
          if (!validateResponse) throw new Error(`Schema ${responseSchemaId} not found`);
          
          if (vector.expected) {
            const valid = validateResponse(vector.expected);
            if (!valid) console.error(`Validation failed for ${tool} expected output:`, validateResponse.errors);
            expect(valid).toBe(true);
          }
        }
      });
    }
  });

  describe("Golden Trace Chain Validation", () => {
    const oldVectorsDir = path.resolve(__dirname, "../../test_vectors/tga");
    const chainPath = path.join(oldVectorsDir, "golden_trace_chain.json");
    if (fs.existsSync(chainPath)) {
      const chain = readJson(chainPath);

      const artifacts = [
        { key: "action_request", schema: "action_request" },
        { key: "supervisor_decision", schema: "supervisor_decision" },
        { key: "tool_call", schema: "tool_call" },
        { key: "tool_effect", schema: "tool_effect" },
      ];

      for (const art of artifacts) {
        test(`validate ${art.key}`, () => {
          const schemaId = `https://talosprotocol.com/schemas/tga/v1/${art.schema}.schema.json`;
          const validate = ajv.getSchema(schemaId);
          if (!validate) throw new Error(`Schema ${schemaId} not found`);

          const data = (chain as any)[art.key];
          const valid = validate(data);
          if (!valid) {
            console.error(`Validation failed for ${art.key}:`, validate.errors);
          }
          expect(valid).toBe(true);
        });
      }
    }
  });

  describe("Adversarial Vectors Validation", () => {
    const oldVectorsDir = path.resolve(__dirname, "../../test_vectors/tga");
    const adversarialPath = path.join(oldVectorsDir, "adversarial_vectors.json");
    if (fs.existsSync(adversarialPath)) {
      const adversarial = readJson(adversarialPath);

    for (const [group, items] of Object.entries(adversarial)) {
      describe(group, () => {
        test.each(items as any[])(`$description`, (item: any) => {
          const data = item.input;
          // Extract schema name from schema_id, e.g. talos.tga.action_request -> action_request
          const schemaPart = data.schema_id.split(".").pop();
          const schemaId = `https://talosprotocol.com/schemas/tga/v1/${schemaPart}.schema.json`;
          const validate = ajv.getSchema(schemaId);
          if (!validate) throw new Error(`Schema ${schemaId} not found`);

          const valid = validate(data);
          expect(valid).toBe(false);

          if (item.error_code) {
            const found = validate.errors?.some(
              (e) => e.keyword === item.error_code,
            );
            if (!found) {
              console.error(
                `Expected error ${item.error_code}, got:`,
                validate.errors,
              );
            }
            expect(found).toBe(true);
          }
        });
      });
    }
  }
});

});
