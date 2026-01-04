# Talos Error Taxonomy v1.0

This document defines the canonical error codes and object shape for all Talos SDKs.

---

## Error Object Shape

All SDKs must return/throw errors with at least this structure:

```json
{
  "code": "TALOS_DENIED",
  "message": "Human-readable description",
  "details": {},
  "request_id": "optional-correlation-id",
  "cause": null
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `code` | string | Yes | One of the defined error codes |
| `message` | string | Yes | Human-readable message |
| `details` | object | No | Additional context (language-specific) |
| `request_id` | string | No | Correlation ID if available |
| `cause` | Error | No | Underlying error if chained |

---

## Error Codes

### Authorization Errors

| Code | Meaning | When Raised |
| :--- | :--- | :--- |
| `TALOS_DENIED` | Authorization denied | `authorize_fast()` returns false, capability scope mismatch |
| `TALOS_INVALID_CAPABILITY` | Capability token invalid | Malformed, expired, or signature invalid |

### Protocol Errors

| Code | Meaning | When Raised |
| :--- | :--- | :--- |
| `TALOS_PROTOCOL_MISMATCH` | Protocol version incompatible | Server protocol outside SDK's supported range |
| `TALOS_FRAME_INVALID` | Wire frame decode failure | Truncated, corrupted, or unknown frame type |

### Crypto Errors

| Code | Meaning | When Raised |
| :--- | :--- | :--- |
| `TALOS_CRYPTO_ERROR` | Cryptographic operation failed | Key derivation, signing, or unsealing failure |
| `TALOS_INVALID_INPUT` | Invalid input parameters | Wrong seed length, malformed key, etc. |

### Transport Errors

| Code | Meaning | When Raised |
| :--- | :--- | :--- |
| `TALOS_TRANSPORT_TIMEOUT` | Transport operation timed out | Connection or send timeout exceeded |
| `TALOS_TRANSPORT_ERROR` | Transport-level failure | Connection refused, network error |

### Ratchet & X3DH Errors (v1.1)

| Code | Meaning | When Raised |
| :--- | :--- | :--- |
| `RATCHET_AUTH_FAILED` | AEAD authentication failed | Ciphertext/Tag validation failed (Wrong key/nonce/AAD) |
| `RATCHET_MAX_SKIP_EXCEEDED` | Too many skipped messages | `skipped_keys` limit hit (DoS protection) |
| `RATCHET_INVALID_HEADER` | Malformed message header | Invalid JSON, missing fields, or bad encoding |
| `RATCHET_INVALID_DH_KEY` | Invalid DH key | Bad curve point or weak key |
| `X3DH_INVALID_SIGNATURE` | Prekey signature invalid | Signed Prekey verification failed |
| `X3DH_MISSING_PREKEY` | One-time prekey missing | Requested OTK not found in bundle |

---

## Negative Test Vector Expectations

Test vectors should include cases where specific errors are expected:

```json
{
  "test_id": "capability_expired",
  "inputs": { "token": "..." },
  "expected_error": {
    "code": "TALOS_INVALID_CAPABILITY",
    "message_contains": "expired"
  }
}
```

SDKs must throw the exact `code` and may include `message_contains` substring validation.
