// typescript/test/vectors.test.ts
// Vector-driven tests for @talosprotocol/contracts

import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  base64urlDecodeToBytes,
  base64urlEncodeBytes,
} from "../src/base64url.js";
import { deriveCursor } from "../src/cursor.js";
import { isUuidV7 } from "../src/uuidv7.js";
import { orderingCompare } from "../src/ordering.js";

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length === 0) return new Uint8Array(0);
  if (hex.length % 2 !== 0) throw new Error("invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

const V = (name: string) => {
  let curr = __dirname;
  // Search upwards for the test_vectors directory
  while (
    !fs.existsSync(path.join(curr, "test_vectors")) &&
    curr !== path.dirname(curr)
  ) {
    curr = path.dirname(curr);
  }
  return path.join(curr, "test_vectors", name);
};

describe("base64url vectors", () => {
  test("valid cases", () => {
    const v = readJson<{ valid: { bytes_hex: string; encoded: string }[] }>(
      V("base64url.json"),
    );
    for (const c of v.valid) {
      expect(base64urlEncodeBytes(hexToBytes(c.bytes_hex))).toBe(c.encoded);
      const decoded = base64urlDecodeToBytes(c.encoded);
      expect(Buffer.from(decoded).toString("hex")).toBe(c.bytes_hex);
    }
  });

  test("invalid cases reject", () => {
    const v = readJson<{ invalid: string[] }>(V("base64url.json"));
    for (const s of v.invalid) {
      expect(() => base64urlDecodeToBytes(s)).toThrow();
    }
  });
});

describe("cursor vectors", () => {
  test("deriveCursor matches goldens", () => {
    const v = readJson<
      { timestamp: number; event_id: string; expected_cursor: string }[]
    >(V("cursor_derivation.json"));
    for (const c of v) {
      expect(deriveCursor(c.timestamp, c.event_id)).toBe(c.expected_cursor);
    }
  });
});

describe("uuidv7 vectors", () => {
  test("valid", () => {
    const v = readJson<{ valid: string[] }>(V("uuidv7.json"));
    for (const id of v.valid) {
      expect(isUuidV7(id)).toBe(true);
    }
  });
  test("invalid", () => {
    const v = readJson<{ invalid: string[] }>(V("uuidv7.json"));
    for (const id of v.invalid) {
      expect(isUuidV7(id)).toBe(false);
    }
  });
});

describe("ordering vectors", () => {
  test("pairs", () => {
    type OrderingCase = {
      a: { timestamp: number; event_id: string };
      b: { timestamp: number; event_id: string };
      expected: -1 | 0 | 1;
    };
    const v = readJson<OrderingCase[]>(V("ordering.json"));
    for (const c of v) {
      expect(orderingCompare(c.a, c.b)).toBe(c.expected);
    }
  });
});
