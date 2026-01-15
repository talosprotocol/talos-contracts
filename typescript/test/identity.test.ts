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
const vectorsDir = path.resolve(__dirname, "../../test_vectors/sdk");

describe("Identity and RBAC Schema Validation", () => {
  // Load rbac schemas
  const rbacIndex = readJson(path.join(rbacDir, "index.json"));
  for (const s of rbacIndex.schemas) {
    if (s.includes("role") || s.includes("binding") || s.includes("envelope"))
      continue;
    const schema = readJson(path.join(rbacDir, s));
    if (!ajv.getSchema(schema.$id)) {
      ajv.addSchema(schema);
    }
  }

  const vectorFile = path.join(vectorsDir, "identity_vectors.json");
  const matrix = readJson(vectorFile);

  for (const [schemaType, categories] of Object.entries(matrix)) {
    describe(`Schema: ${schemaType}`, () => {
      // @ts-expect-error - iterating over object entries
      for (const [category, vectors] of Object.entries(categories)) {
        const isValidExpected = category === "valid";

        // @ts-expect-error - vectors is any[]
        test.each(vectors)(`[${category}] $name`, (vector: any) => {
          const { data, error_code } = vector;
          const schemaId = `https://talosprotocol.com/schemas/rbac/${schemaType}.schema.json`;
          const validate = ajv.getSchema(schemaId);
          if (!validate) {
            throw new Error(`Schema not found: ${schemaId}`);
          }

          const isValid = validate(data);
          if (isValid !== isValidExpected) {
            console.error(
              `Validation failed for ${vector.name}:`,
              validate.errors,
            );
            // If expected Invalid but got Valid, log error
          }
          expect(isValid).toBe(isValidExpected);

          if (!isValidExpected && error_code) {
            // Verify that at least one error corresponds to the expected code (keyword)
            const found = validate.errors?.some(
              (e) => e.keyword === error_code,
            );
            if (!found) {
              console.error(
                `Expected error code ${error_code} not found. Got:`,
                validate.errors,
              );
            }
            expect(found).toBe(true);
          }
        });
      }
    });
  }
});
