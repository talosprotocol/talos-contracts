# Talos SDK API Surface Rules

This document defines the requirements and allowed deviations for API parity across all Talos SDKs.

---

## Hard Requirements

All SDKs **MUST** implement these exactly:

### Method Names (Canonical)
- Use method IDs from `api_surface.json` as the canonical reference
- Language-specific naming follows conventions below

### Required Parameters
- All parameters marked `required: true` must exist
- Parameter order should match the canonical order where possible

### Return Types
- Must return equivalent types as specified
- `bytes[N]` means fixed-length byte array
- `object` means language-appropriate dictionary/map

### Error Codes
- All 8 error codes from `required_errors` must exist
- Error object shape must match `schemas/error.schema.json`

### Determinism
- Methods marked `deterministic: true` must produce identical output for identical input across all SDKs

---

## Allowed Deviations

These differences are permitted but **MUST** be documented in `sdk/deviations/<language>.json`:

### Naming Conventions
| Python | TypeScript | Rust | Go | Java |
| :--- | :--- | :--- | :--- | :--- |
| `snake_case` | `camelCase` | `snake_case` | `PascalCase` | `camelCase` |
| `to_did` | `toDid` | `to_did` | `ToDid` | `toDid` |

### Optional Parameters
- Python: keyword arguments with defaults
- TypeScript: optional parameters `?` or options object
- Rust: builder pattern or `Option<T>`
- Go: functional options or separate methods
- Java: overloaded methods or builder

### Async/Sync
- TypeScript: all async methods return `Promise<T>`
- Python: provide both sync and async variants where marked
- Rust: async with `tokio` or sync based on feature flag
- Go: sync with context parameter
- Java: `CompletableFuture<T>` or blocking

### Error Handling
- Python: raise exceptions
- TypeScript: throw Error subclasses
- Rust: `Result<T, TalosError>`
- Go: return `(T, error)`
- Java: throw checked/unchecked exceptions

---

## Deviations Allowlist

Create `sdk/deviations/<language>.json` for each SDK:

```json
{
  "language": "typescript",
  "version": "1.0.0",
  "deviations": [
    {
      "method_id": "client.connect",
      "deviation": "Returns Promise<void> instead of void",
      "reason": "JavaScript async convention"
    }
  ]
}
```

**The allowlist is version-controlled in `talos-contracts`, not in each SDK repo.**

---

## Surface Checker

The conformance runner validates:
1. All required method IDs exist
2. Parameter counts match (within deviation allowlist)
3. Error codes are defined
4. Version exports exist:
   - `SDK_VERSION`
   - `SUPPORTED_PROTOCOL_RANGE`
   - `CONTRACT_MANIFEST_HASH`

---

## Version Lock

Each SDK must export:
- `SDK_VERSION`: semver string
- `SUPPORTED_PROTOCOL_RANGE`: `["1.0", "1.x"]`
- `CONTRACT_MANIFEST_HASH`: SHA256 of `api_surface.json` at build time
