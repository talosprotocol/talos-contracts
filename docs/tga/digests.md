# TGA Artifact Digest Specification

This document defines the normative rules for calculating and verifying digests of Talos Governance Agent (TGA) artifacts. Deterministic hashing is critical for the cryptographic trace chain (AR → SD → TC → TE).

## Algorithm

All TGA digests MUST use **SHA-256**.

- **Field**: `_digest`
- **Algorithm Identifier**: `_digest_alg: "sha256"` (fixed enum)

## Canonicalization

Before hashing, the JSON payload MUST be canonicalized according to a subset of **RFC 8785** (JSON Canonicalization Scheme):

1.  **Key Sorting**: All object keys MUST be sorted lexicographically (alphabetic order).
2.  **Whitespace**: No whitespace is allowed between keys, values, colons, or commas.
    - Correct: `{"key1":"val1","key2":"val2"}`
    - Incorrect: `{"key1": "val1", "key2": "val2"}`
3.  **Encoding**: The resulting string MUST be encoded as **UTF-8** bytes.
4.  **Scalars**:
    - Numbers MUST be represented without exponent notation if possible.
    - Floats SHOULD be avoided in TGA schemas; integer or string representations are preferred for security-sensitive values.
    - Null values MUST be represented as `null`.

## Field Exclusion Rule

To allow the digest to be stored within the artifact itself, the `_digest` field MUST be excluded from the canonicalization process:

1.  Take the full artifact object.
2.  Remove the `_digest` field.
3.  Canonicalize the remaining object.
4.  Hash the canonical bytes.

## Encoding & Validation

- **Format**: Lowercase hexadecimal string.
- **Length**: Exactly 64 characters.
- **Regex**: `^[0-9a-f]{64}$`

## Reference Implementations

- **TypeScript**: `calculateDigest` in `typescript/src/infrastructure/canonical.ts`
- **Python**: `calculate_digest` in `python/talos_contracts/infrastructure/canonical.py`
