import { describe, it, expect } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("MCP Tool Registry Schema Validation", () => {
  const ajv = new Ajv2020({ strict: false, allErrors: true });

  const schemaPath = path.resolve(
    __dirname,
    "../../schemas/mcp/tool_registry.schema.json",
  );
  const vectorPath = path.resolve(
    __dirname,
    "../../test_vectors/mcp/tool_registry_vectors.json",
  );

  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  const vectors = JSON.parse(fs.readFileSync(vectorPath, "utf-8"));

  const validate = ajv.compile(schema);

  describe("Valid cases", () => {
    for (const test of vectors.valid_cases) {
      it(test.description, () => {
        const valid = validate(test.data);
        if (!valid) {
          console.error("Validation errors:", validate.errors);
        }
        expect(valid).toBe(true);
      });
    }
  });

  describe("Invalid cases", () => {
    for (const test of vectors.invalid_cases) {
      it(test.description, () => {
        const valid = validate(test.data);
        expect(valid).toBe(false);

        if (test.expected_error) {
          const hasExpectedError = validate.errors?.some(
            (e) => e.keyword === test.expected_error,
          );
          expect(hasExpectedError).toBe(true);
        }
      });
    }
  });
});
