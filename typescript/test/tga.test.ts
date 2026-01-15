import { describe, expect, test } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

function readJson(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const schemasDir = path.resolve(__dirname, "../../schemas/tga/v1");
const vectorsDir = path.resolve(__dirname, "../../test_vectors/tga");

describe("TGA v1 Schema Validation (Hardened)", () => {
  // Load TGA v1 schemas
  const tgaIndex = readJson(path.join(schemasDir, "index.json"));
  for (const s of tgaIndex.schemas) {
    const schema = readJson(path.join(schemasDir, s));
    if (!ajv.getSchema(schema.$id)) {
      ajv.addSchema(schema);
    }
  }

  describe("Golden Trace Chain Validation", () => {
    const chain = readJson(path.join(vectorsDir, "golden_trace_chain.json"));

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

        const data = chain[art.key];
        const valid = validate(data);
        if (!valid) {
          console.error(`Validation failed for ${art.key}:`, validate.errors);
        }
        expect(valid).toBe(true);
      });
    }
  });

  describe("Adversarial Vectors Validation", () => {
    const adversarial = readJson(
      path.join(vectorsDir, "adversarial_vectors.json"),
    );

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
  });
});
