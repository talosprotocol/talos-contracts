# Talos SDK Versioning Policy

This document defines versioning rules for contracts, SDKs, and protocol compatibility.

---

## Version Types

| Artifact | Format | Example |
| :--- | :--- | :--- |
| Protocol | `MAJOR.MINOR` | `1.0` |
| Contracts | `MAJOR.MINOR.PATCH` | `1.0.0` |
| SDK | `MAJOR.MINOR.PATCH` | `1.0.0` |

---

## Protocol Version

The wire protocol version. Breaking changes increment MAJOR.

- `1.0` - Initial stable release
- `1.1` - Backwards-compatible additions
- `2.0` - Breaking changes

---

## SDK Exports

Every SDK **MUST** export these constants:

```python
# Python
SDK_VERSION = "1.0.0"
SUPPORTED_PROTOCOL_RANGE = ("1.0", "1.x")
CONTRACT_MANIFEST_HASH = "sha256:abc123..."
```

```typescript
// TypeScript
export const SDK_VERSION = "1.0.0";
export const SUPPORTED_PROTOCOL_RANGE = ["1.0", "1.x"];
export const CONTRACT_MANIFEST_HASH = "sha256:abc123...";
```

---

## Compatibility Rules

### SDK → Protocol
- SDK declares supported protocol range
- Runtime validation on `Client.connect()`:
  - If server protocol outside range → `TALOS_PROTOCOL_MISMATCH`

### SDK → Contracts
- SDK pins to a specific contracts version at build time
- `CONTRACT_MANIFEST_HASH` proves which contract was used
- Breaking contract changes require SDK major bump

---

## Vector Set Selection

Vectors are tagged with required protocol version:

```json
{
  "vector_id": "sign_verify_001",
  "required_protocol": "1.0",
  "features": ["identity", "mcp_security"]
}
```

The conformance runner supports flags:
- `--protocol 1.0` - Run only vectors for protocol 1.0
- `--features identity` - Run only identity vectors

---

## Backwards Compatibility

### Breaking Changes (MAJOR bump)
- Removing required methods
- Changing required parameter types
- Changing error codes
- Changing wire format

### Non-Breaking (MINOR bump)
- Adding optional methods
- Adding optional parameters with defaults
- Adding new error codes (with stable shape)

### Patches (PATCH bump)
- Bug fixes
- Documentation
- Performance improvements

---

## Deprecation

1. Mark deprecated in docs + `@deprecated` annotation
2. Emit warning for 2 minor versions
3. Remove in next major version

---

## Release Cadence

- Contracts: release when surface changes
- SDKs: release when implementation changes
- Coordinated releases for breaking changes
