// test/vectors/golden.test.ts
// Golden vector tests - locked inputs/outputs to prevent refactor drift

import { describe, it, expect } from "vitest";
import {
  base64urlEncodeBytes,
  base64urlDecodeToBytes,
  Base64UrlError,
  isUuidV7,
  isCanonicalLowerUuid,
  deriveCursor,
  decodeCursor,
  compareCursor,
  assertCursorInvariant,
  orderingCompare,
  redactEvent,
  redactGatewaySnapshot,
} from "../../src/index.js";
import vectors from "./golden.json";

describe("Golden Vectors: base64url", () => {
  describe("encode", () => {
    for (const tc of vectors.base64url.encode) {
      it(`encodes [${tc.input.slice(0, 3).join(",")}...] → "${tc.expected}"`, () => {
        const result = base64urlEncodeBytes(new Uint8Array(tc.input));
        expect(result).toBe(tc.expected);
      });
    }
  });

  describe("decode", () => {
    for (const tc of vectors.base64url.decode) {
      it(`decodes "${tc.input}" → [${tc.expected.slice(0, 3).join(",")}...]`, () => {
        const result = base64urlDecodeToBytes(tc.input);
        expect(Array.from(result)).toEqual(tc.expected);
      });
    }
  });

  describe("invalid", () => {
    for (const tc of vectors.base64url.invalid) {
      it(`rejects "${tc.input}" with error containing "${tc.error}"`, () => {
        expect(() => base64urlDecodeToBytes(tc.input)).toThrow(Base64UrlError);
      });
    }
  });
});

describe("Golden Vectors: uuidv7", () => {
  describe("valid", () => {
    for (const uuid of vectors.uuidv7.valid) {
      it(`accepts ${uuid}`, () => {
        expect(isUuidV7(uuid)).toBe(true);
      });
    }
  });

  describe("invalid", () => {
    for (const uuid of vectors.uuidv7.invalid) {
      it(`rejects ${uuid}`, () => {
        expect(isUuidV7(uuid)).toBe(false);
      });
    }
  });

  describe("canonical_lower", () => {
    for (const tc of vectors.uuidv7.canonical_lower) {
      it(`isCanonicalLowerUuid("${tc.input}") = ${tc.expected}`, () => {
        expect(isCanonicalLowerUuid(tc.input)).toBe(tc.expected);
      });
    }
  });

  describe("valid_but_not_canonical", () => {
    for (const tc of vectors.uuidv7.valid_but_not_canonical) {
      it(`"${tc.input}" is valid v7 but not canonical`, () => {
        expect(isUuidV7(tc.input)).toBe(tc.isV7);
        expect(isCanonicalLowerUuid(tc.input)).toBe(tc.isCanonicalLower);
      });
    }
  });
});

describe("Golden Vectors: cursor", () => {
  describe("derive", () => {
    for (const tc of vectors.cursor.derive) {
      it(`derives cursor for ts=${tc.timestamp}`, () => {
        const result = deriveCursor(tc.timestamp, tc.event_id);
        expect(result).toBe(tc.expected);
      });
    }
  });

  describe("decode", () => {
    for (const tc of vectors.cursor.decode) {
      it(`decodes "${tc.input.slice(0, 20)}..."`, () => {
        const result = decodeCursor(tc.input);
        expect(result).toEqual(tc.expected);
      });
    }
  });

  describe("compare", () => {
    for (const tc of vectors.cursor.compare) {
      it(`compareCursor returns ${tc.expected}`, () => {
        const result = compareCursor(tc.a, tc.b);
        expect(result).toBe(tc.expected);
      });
    }
  });

  describe("invariant", () => {
    for (const tc of vectors.cursor.invariant) {
      const { event, expected } = tc;
      it(`assertCursorInvariant returns ok=${expected.ok}`, () => {
        const result = assertCursorInvariant(event);
        expect(result.ok).toBe(expected.ok);
        if (!expected.ok && expected.reason) {
          expect((result as { reason: string }).reason).toBe(expected.reason);
        }
      });
    }
  });
});

describe("Golden Vectors: ordering", () => {
  describe("compare", () => {
    for (const tc of vectors.ordering.compare) {
      it(`orderingCompare returns ${tc.expected} (${tc._comment || ""})`, () => {
        const result = orderingCompare(tc.a, tc.b);
        expect(result).toBe(tc.expected);
      });
    }
  });
});

describe("Golden Vectors: redaction", () => {
  describe("event", () => {
    for (const tc of vectors.redaction.event) {
      it(`redacts event at level "${tc.level}"`, () => {
        const result = redactEvent(tc.input as any, tc.level as any);
        // Auth headers should be stripped
        expect(result.request?.headers?.authorization).toBeUndefined();
        expect(result.request?.headers?.cookie).toBeUndefined();
        expect(result.request?.headers?.["x-api-key"]).toBeUndefined();
        // Non-auth headers preserved
        for (const [key, value] of Object.entries(tc.expected_headers)) {
          expect(result.request?.headers?.[key]).toBe(value);
        }
      });
    }
  });

  describe("gateway", () => {
    for (const tc of vectors.redaction.gateway) {
      it(`strips secrets from gateway snapshot`, () => {
        const result = redactGatewaySnapshot(tc.input as any);
        expect(result.version).toBe(tc.expected.version);
        expect(result.internal_endpoints).toBeUndefined();
        expect(result.keys).toBeUndefined();
        expect(result.tokens).toBeUndefined();
      });
    }
  });
});
