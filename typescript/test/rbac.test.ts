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

const schemasDir = path.resolve(__dirname, "../../schemas");
const rbacDir = path.resolve(schemasDir, "rbac");
const vectorsDir = path.resolve(__dirname, "../../test_vectors/rbac");

describe("RBAC Schema Validation", () => {
  // Load rbac schemas
  const rbacIndex = readJson(path.join(rbacDir, "index.json"));
  for (const s of rbacIndex.schemas) {
    const schema = readJson(path.join(rbacDir, s));
    // Prevent duplicate addition if multiple tests run in same context (though files are isolated usually)
    if (!ajv.getSchema(schema.$id)) {
      ajv.addSchema(schema);
    }
  }

  const vectorFile = path.join(vectorsDir, "rbac_vectors.json");
  const vectors = readJson(vectorFile);

  // Map vector keys to schema IDs
  const mappings = {
    valid_roles: { schema: "role", valid: true },
    invalid_roles: { schema: "role", valid: false },
    valid_bindings: { schema: "binding", valid: true },
    invalid_bindings: { schema: "binding", valid: false },
  };

  for (const [key, config] of Object.entries(mappings)) {
    describe(`${key} (${config.schema})`, () => {
      // @ts-expect-error - implicit any
      const items = vectors[key];
      if (!items) return;

      test.each(items)(`$description`, (item: any) => {
        const data = item.input;
        const schemaId = `https://talosprotocol.com/schemas/rbac/${config.schema}.schema.json`;
        const validate = ajv.getSchema(schemaId);
        if (!validate) throw new Error(`Schema ${schemaId} not found`);

        const valid = validate(data);
        if (valid !== config.valid) {
          console.error(
            `Validation failed for ${item.description}:`,
            validate.errors,
          );
        }
        expect(valid).toBe(config.valid);

        if (!config.valid && item.error_code) {
          const found = validate.errors?.some(
            (e) => e.keyword === item.error_code,
          );
          if (!found) {
            console.error(
              `Expected error code ${item.error_code} not found. Got:`,
              validate.errors,
            );
          }
          expect(found).toBe(true);
        }
      });
    });
  }
});
