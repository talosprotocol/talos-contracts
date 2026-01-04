# Talos Canonical JSON Specification v1.0

All Talos SDKs must use identical JSON canonicalization to ensure:
- Deterministic hashing
- Reproducible signatures
- Cross-language interoperability

---

## Rules

### 1. Encoding
- UTF-8 only
- No BOM

### 2. Key Ordering
- Object keys MUST be sorted **lexicographically** (Unicode code point order)
- Nested objects follow the same rule

### 3. Whitespace
- **No whitespace** outside strings
- No trailing newlines
- No indentation

### 4. Numbers
- Integers: No leading zeros, no plus sign
- No exponential notation for integers that fit in int64
- No trailing decimal zeros
- `-0` is serialized as `0`

### 5. Strings
- Minimal escaping: only `\"`, `\\`, and control chars (`\n`, `\r`, `\t`, etc.)
- No unnecessary Unicode escapes (use literal UTF-8)
- No trailing spaces

### 6. Booleans & Null
- Lowercase: `true`, `false`, `null`

---

## Example

Input (unordered):
```json
{
  "name": "Alice",
  "age": 30,
  "active": true,
  "metadata": {
    "z_field": 1,
    "a_field": 2
  }
}
```

Canonical output:
```json
{"active":true,"age":30,"metadata":{"a_field":2,"z_field":1},"name":"Alice"}
```

---

## Implementation Notes

### Python
Use `json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False)`

### TypeScript
Sort keys manually before `JSON.stringify` with no spaces.

### Rust
Use `serde_json` with a custom serializer that sorts keys.

---

## Verification

Test vectors include canonicalization cases:
- `canonical_json.json`: input objects and expected canonical output bytes
- Hash the canonical bytes and compare to expected hash
