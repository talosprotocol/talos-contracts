import { describe, expect, test } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv({ strict: false });
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
    const schema = readJson(path.join(rbacDir, s));
    ajv.addSchema(schema);
  }

  const vectorFile = path.join(vectorsDir, "identity_validation.json");
  const { vectors } = readJson(vectorFile);

  test.each(vectors)("vector: $id", (...args: any[]) => {
    const vector = args[0];
    const { schema, data, valid } = vector;
    // We expect schemas to be indexed by their $id which is https://talosprotocol.com/schemas/rbac/{name}.schema.json
    const schemaId = `https://talosprotocol.com/schemas/rbac/${schema}.schema.json`;
    const validate = ajv.getSchema(schemaId);
    if (!validate) {
      throw new Error(`Schema not found: ${schemaId}`);
    }

    const isValid = validate(data);
    expect(isValid).toBe(valid);
  });
});
