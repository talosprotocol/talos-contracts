import { describe, test, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const SCHEMA_DIR = path.resolve(__dirname, "../../schemas/a2a");
const VECTOR_DIR = path.resolve(__dirname, "../../test_vectors/a2a");

const ajv = new Ajv({ strict: false, discriminator: true });
addFormats(ajv);

// Helper to read JSON
function readJson(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

describe("A2A Schema Validation", () => {
  // Load all schemas before tests
  beforeAll(() => {
    const index = readJson(path.join(SCHEMA_DIR, "index.json"));
    for (const schemaFile of index.schemas) {
      const schemaPath = path.join(SCHEMA_DIR, schemaFile);
      const schema = readJson(schemaPath);
      // Fix ID resolution for local refs if needed, or rely on $id
      // AJV uses $id. Our schemas have https://talos.network/schemas/a2a/...
      // Refs use relative paths like profile.schema.json
      // We might need to map IDs or use addSchema.
      // If $id is present, AJV indexes by it.
      // Relative refs depend on base URI.
      // For simplicity in this test environment, we might need to adjust refs or ensure IDs match retrieval.
      // However, let's try adding them as is.
      try {
        ajv.addSchema(schema);
      } catch (e: any) {
        // If ID conflict or missing, log
        console.warn(`Failed to add schema ${schemaFile}: ${e.message}`);
      }
    }
  });

  // Vector -> Schema Mapping
  const vectors = [
    {
      file: "profile_minimal.json",
      schema: "profile.schema.json",
      valid: true,
    },
    {
      file: "agent_card_minimal.json",
      schema: "agent_card.schema.json",
      valid: true,
    },
    {
      file: "agent_card_with_x_talos.json",
      schema: "agent_card.schema.json",
      valid: true,
    },
    {
      file: "tasks_send_sync.json",
      schema: "methods/tasks_send.request.schema.json",
      valid: true,
    },
    {
      file: "tasks_get.json",
      schema: "methods/tasks_get.request.schema.json",
      valid: true,
    },
    {
      file: "tasks_cancel.json",
      schema: "methods/tasks_cancel.request.schema.json",
      valid: true,
    },
    {
      file: "tasks_resubscribe.json",
      schema: "methods/tasks_resubscribe.request.schema.json",
      valid: true,
    },
    {
      file: "error_mapping_domain.json",
      schema: "jsonrpc_response.schema.json",
      valid: true,
    },
    {
      file: "error_protocol_invalid_params.json",
      schema: "jsonrpc_response.schema.json",
      valid: true,
    },

    // Fail Cases
    {
      file: "invalid_missing_id.json",
      schema: "jsonrpc_request.schema.json",
      valid: false,
    }, // Fails required ID
    {
      file: "invalid_result_and_error.json",
      schema: "jsonrpc_response.schema.json",
      valid: false,
    }, // Fails oneOf
    {
      file: "invalid_jsonrpc_version.json",
      schema: "jsonrpc_request.schema.json",
      valid: false,
    }, // Fails version
    {
      file: "invalid_timestamp_format.json",
      schema: "task.schema.json",
      valid: false,
    }, // Fails date-time
  ];

  /*
   * Special handling for SSE Events Array
   * logic: Load array, validate each item against sse_event.schema.json
   */
  test("tasks_send_subscribe_sse_events.json", () => {
    const vector = readJson(
      path.join(VECTOR_DIR, "tasks_send_subscribe_sse_events.json"),
    );
    expect(Array.isArray(vector)).toBe(true);

    // Compile validator (ensure schema covers all refs)
    // We access by ID ideally. The ID for sse_event is...
    const sid = "https://talos.network/schemas/a2a/sse_event.schema.json";
    const validate = ajv.getSchema(sid);
    if (!validate) throw new Error(`Schema ${sid} not found`);

    for (const event of vector) {
      const valid = validate(event);
      if (!valid) {
        console.error("Validation failed for event:", event, validate.errors);
      }
      expect(valid).toBe(true);
    }
  });

  test.each(vectors)(
    "Vector $file should be valid=$valid",
    ({ file, schema: schemaName, valid }) => {
      const vector = readJson(path.join(VECTOR_DIR, file));

      // Resolve full ID for schemaName
      // We map filename to ID suffix or just read the file content to get ID?
      // Let's read file to get ID or just rely on filename if we added it with a key?
      // ajv.addSchema(schema) uses the schema's $id.
      // We need to know the IDs.
      // Simpler: Read schema file, get $id, get validator.
      const schemaContent = readJson(path.join(SCHEMA_DIR, schemaName));
      const schemaId = schemaContent["$id"];

      const validate = ajv.getSchema(schemaId);
      if (!validate) throw new Error(`Schema ID ${schemaId} not found`);

      const isValid = validate(vector);

      if (isValid !== valid) {
        console.error(
          `Mismatch for ${file}. Expected valid=${valid}, got ${isValid}. Errors:`,
          validate.errors,
        );
      }
      expect(isValid).toBe(valid);
    },
  );
});
