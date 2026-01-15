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
const secretsDir = path.resolve(schemasDir, "secrets");
const vectorsDir = path.resolve(__dirname, "../../test_vectors/secrets");

describe("Secrets Envelope Schema Validation", () => {
  // Load envelope schema manually
  const schemaPath = path.join(secretsDir, "envelope.schema.json");
  if (fs.existsSync(schemaPath)) {
    const schema = readJson(schemaPath);
    ajv.addSchema(schema);
  } else {
    throw new Error("envelope.schema.json not found");
  }

  const vectorFile = path.join(vectorsDir, "envelope_vectors.json");
  const vectors = readJson(vectorFile);

  describe("Envelope Vectors", () => {
    test.each(vectors.valid)("[Valid] $description", (item: any) => {
      const data = item.input; // Vectors structure: input is the data
      const schemaId =
        "https://talosprotocol.com/schemas/secrets/envelope.schema.json";
      const validate = ajv.getSchema(schemaId);
      if (!validate) throw new Error("Schema not found");

      const valid = validate(data);
      if (!valid) {
        console.error(
          `Validation failed for ${item.description}:`,
          validate.errors,
        );
      }
      expect(valid).toBe(true);
    });

    test.each(vectors.invalid)("[Invalid] $description", (item: any) => {
      const data = item.input;
      const schemaId =
        "https://talosprotocol.com/schemas/secrets/envelope.schema.json";
      const validate = ajv.getSchema(schemaId);
      if (!validate) throw new Error("Schema not found");

      const valid = validate(data);
      expect(valid).toBe(false);

      if (item.error_code) {
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
});
