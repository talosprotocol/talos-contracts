import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";

const VECTOR_PATH = path.join(
  __dirname,
  "../../test_vectors/audit_event_vectors.json",
);
const SCHEMA_PATH = path.join(
  __dirname,
  "../../schemas/audit/audit_event.schema.json",
);

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

// RFC 8785 JCS-like canonicalization for simple types (Keys sorted, no whitespace)
function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== "object" || obj === undefined) {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalize).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const acc = [];
  for (const k of keys) {
    if (obj[k] === undefined) continue;
    acc.push(JSON.stringify(k) + ":" + canonicalize(obj[k]));
  }
  return "{" + acc.join(",") + "}";
}

describe("Audit Event Vectors (Hardened)", () => {
  const vectors = readJson<any>(VECTOR_PATH);
  const schema = readJson<any>(SCHEMA_PATH);

  // Setup Ajv
  const ajv = new Ajv2019({ strict: false, allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  test("Vector file loads", () => {
    expect(vectors).toBeDefined();
    expect(vectors.tests.length).toBeGreaterThan(0);
  });

  for (const t of vectors.tests) {
    test(`Case: ${t.name}`, () => {
      // 1. Re-compute JCS Canonical JSON from event_without_hash
      const canonical = canonicalize(t.event_without_hash);

      // 2. Verify against vector's canonical_bytes_hex
      const expectedHex = t.canonical_bytes_hex;
      const actualHex = Buffer.from(canonical, "utf-8").toString("hex");
      expect(actualHex).toBe(expectedHex);

      // 3. Re-compute Hash
      const hash = crypto.createHash("sha256").update(canonical).digest("hex");
      expect(hash).toBe(t.event_hash);

      // 4. Verify HMAC IP Hashing if input provided
      if (
        t.input_context &&
        t.input_context.client_ip &&
        t.input_context.ip_hmac_key
      ) {
        const hmac = crypto.createHmac("sha256", t.input_context.ip_hmac_key);
        hmac.update(t.input_context.client_ip);
        const actualIpHash = hmac.digest("hex");

        const ipHashInEvent = t.event_without_hash.http.client_ip_hash;
        expect(ipHashInEvent).toBeDefined();
        expect(ipHashInEvent).toBe(actualIpHash);
      }

      // 5. Schema Validation (Full event with hash)
      // Construct full event for validation
      const fullEvent = {
        ...t.event_without_hash,
        event_hash: t.event_hash,
      };
      const valid = validate(fullEvent);
      if (!valid) {
        console.error("Schema errors:", validate.errors);
      }
      expect(valid).toBe(true);
    });
  }

  test("Negative: Extra property in root rejected", () => {
    // Use first valid vector as base
    const base = {
      ...vectors.tests[0].event_without_hash,
      event_hash: vectors.tests[0].event_hash,
    };
    const invalid = { ...base, extra_field: "should_fail" };
    const valid = validate(invalid);
    expect(valid).toBe(false);
    expect(validate.errors?.[0].message).toMatch(
      /must NOT have additional properties/,
    );
  });

  test("Negative: Extra property in nested http rejected", () => {
    const base = {
      ...vectors.tests[0].event_without_hash,
      event_hash: vectors.tests[0].event_hash,
    };
    const invalid = JSON.parse(JSON.stringify(base));
    invalid.http.extra_http = "fail";
    expect(validate(invalid)).toBe(false);
  });

  test("Negative: Scalar Meta enforcement", () => {
    const base = {
      ...vectors.tests[0].event_without_hash,
      event_hash: vectors.tests[0].event_hash,
    };
    const invalid = JSON.parse(JSON.stringify(base));
    // Add object value to meta (forbidden)
    invalid.meta = { ...invalid.meta, nested_obj: { key: "val" } };
    expect(validate(invalid)).toBe(false);
  });

  test("Negative: Conditional Signer Key (Bearer mode should reject signer_key_id)", () => {
    const base = {
      ...vectors.tests[0].event_without_hash,
      event_hash: vectors.tests[0].event_hash,
    };
    const invalid = JSON.parse(JSON.stringify(base));
    // Base is 'bearer', add signer_key_id
    invalid.principal.signer_key_id = "should-not-be-here";
    // This might fail due to strict additionalProperties or allOf logic
    expect(validate(invalid)).toBe(false);
  });

  test("Negative: Conditional Signer Key (Signed mode should require signer_key_id)", () => {
    // Find a signed vector or modify base
    const base = {
      ...vectors.tests[0].event_without_hash,
      event_hash: vectors.tests[0].event_hash,
    };
    const invalid = JSON.parse(JSON.stringify(base));
    invalid.principal.auth_mode = "signed";
    delete invalid.principal.signer_key_id;
    expect(validate(invalid)).toBe(false);
  });
});
