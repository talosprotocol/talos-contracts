import { createHash } from "node:crypto";

/**
 * Serializes a value to canonical JSON bytes according to RFC 8785 (subset).
 * - Keys sorted alphabetically.
 * - No whitespace in separators.
 * - UTF-8 encoding.
 *
 * Note: This implementation handles objects, arrays, and scalars.
 * For TGA contracts, we'll use this for digest calculation.
 */
export function canonicalJsonBytes(data: any): Uint8Array {
  const canonicalize = (val: any): any => {
    if (val === null || typeof val !== "object") {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(canonicalize);
    }
    const keys = Object.keys(val).sort();
    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = canonicalize(val[key]);
    }
    return result;
  };

  const str = JSON.stringify(
    canonicalize(data),
    (key, value) => {
      // Ensure no whitespace in separators happens via stringify defaults in some envs,
      // but standard JSON.stringify(obj) has no spaces between keys/values.
      return value;
    },
    0,
  );

  return new TextEncoder().encode(str);
}

/**
 * Calculates SHA-256 digest of an object after canonicalization.
 * Optionally excludes specific fields (e.g., '_digest').
 */
export function calculateDigest(
  data: any,
  excludeFields: string[] = ["_digest"],
): string {
  const cleanData = { ...data };
  for (const field of excludeFields) {
    delete cleanData[field];
  }
  const bytes = canonicalJsonBytes(cleanData);
  return createHash("sha256").update(bytes).digest("hex");
}
