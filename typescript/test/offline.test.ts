import { describe, it, expect } from "vitest";
import Ajv2020 from "ajv/dist/2020";
import metaDraft7 from "ajv/dist/refs/json-schema-draft-07.json" assert { type: "json" };
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";

describe("Offline Schema Validation", () => {
  const ajv = new Ajv2020({ strict: false });
  ajv.addMetaSchema(metaDraft7);
  addFormats(ajv);

  // Load schemas from local filesystem only
  const schemaDir = path.resolve(__dirname, "../../schemas");

  const loadLocalSchema = (relativePath: string) => {
    const fullPath = path.join(schemaDir, relativePath);
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  };

  it("validates AuditEvent schema without network resolution", async () => {
    const eventSchema = loadLocalSchema("audit/events/ai_gateway.schema.json");
    const validate = ajv.compile(eventSchema);

    const validEvent = {
      request_id: "req_123",
      timestamp: new Date().toISOString(),
      event_type: "request_received",
      surface: "llm",
      outcome: "success",
    };

    expect(validate(validEvent)).toBe(true);
  });

  it("validates Principal schema and ensures NO external $ref resolution is required", () => {
    // Principal schema has no $ref to external URLs
    const principalSchema = loadLocalSchema("rbac/principal.schema.json");

    // Scan for any $ref that starts with http
    const schemaStr = JSON.stringify(principalSchema);
    expect(schemaStr).not.toContain('"$ref":"http');

    const validate = ajv.compile(principalSchema);
    expect(validate).toBeDefined();
  });

  it("validates Provider Catalog against its schema offline", () => {
    const catalogSchema = loadLocalSchema(
      "catalog/provider_catalog.schema.json",
    );
    // We also need to load the template schema since it's $ref-ed
    const templateSchema = loadLocalSchema(
      "catalog/provider_template.schema.json",
    );

    // Add template schema to ajv so it can resolve the $ref
    ajv.addSchema(templateSchema);

    const validate = ajv.compile(catalogSchema);

    const catalogPath = path.resolve(
      __dirname,
      "../../catalog/provider_templates.json",
    );
    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

    const isValid = validate(catalog);
    if (!isValid) {
      console.log("Catalog validation errors:", validate.errors);
    }
    expect(isValid).toBe(true);
  });
});
