# Talos SDK Contract v1.0

> **Status**: Canonical  
> **Protocol Version**: 1.0  
> **Last Updated**: 2026-01-04

This document defines the **required API surface** that all Talos SDKs must implement to achieve cross-language parity.

---

## Versioning

| Field | Value |
| :--- | :--- |
| Contract Version | 1.0.0 |
| Protocol Version | 1.0 |
| Supported Protocol Range | 1.0 - 1.x |

Each SDK declares its supported protocol range. Mismatches raise `TALOS_PROTOCOL_MISMATCH`.

---

## Tier Definitions

| Tier | Meaning |
| :--- | :--- |
| **Required (v1.0)** | Must be implemented identically across all SDKs |
| **Optional (v1.0)** | May exist but not required for v1 compliance |
| **Post-v1** | Not required; planned for future versions |

---

## Module: Identity

### `Wallet` Class

#### `Wallet.generate(name: string?) -> Wallet` [Required]
- **Inputs**: Optional human-readable name
- **Outputs**: New `Wallet` instance with generated keypair
- **Determinism**: Non-deterministic (uses secure random)
- **Errors**: `TALOS_CRYPTO_ERROR`

#### `Wallet.from_seed(seed: bytes[32]) -> Wallet` [Required]
- **Inputs**: 32-byte seed (raw bytes or base64url string accepted)
- **Outputs**: `Wallet` instance derived deterministically from seed
- **Determinism**: **Deterministic** - same seed produces identical keypair
- **Errors**: `TALOS_INVALID_INPUT` if seed length != 32

#### `wallet.to_did() -> string` [Required]
- **Outputs**: DID string in format `did:key:z6Mk...`
- **Determinism**: Deterministic

#### `wallet.address -> string` [Required]
- **Outputs**: Hex-encoded public key hash (64 chars)
- **Determinism**: Deterministic

#### `wallet.sign(message: bytes) -> bytes[64]` [Required]
- **Inputs**: Arbitrary message bytes
- **Outputs**: 64-byte Ed25519 signature
- **Determinism**: Deterministic (Ed25519 is deterministic)
- **Errors**: `TALOS_CRYPTO_ERROR`

#### `wallet.verify(message: bytes, signature: bytes, public_key: bytes) -> bool` [Required]
- **Inputs**: Message, 64-byte signature, 32-byte public key
- **Outputs**: `true` if valid, `false` otherwise
- **Errors**: None (returns false on invalid)

---

## Module: Capabilities

#### `parse_capability(token: string) -> CapabilityToken` [Required]
- **Inputs**: Base64url-encoded capability token
- **Outputs**: Parsed `CapabilityToken` object
- **Errors**: `TALOS_INVALID_CAPABILITY`, `TALOS_FRAME_INVALID`

#### `verify_capability(token: CapabilityToken, issuer_key: bytes) -> bool` [Required]
- **Inputs**: Parsed token, issuer's 32-byte public key
- **Outputs**: `true` if signature valid and not expired
- **Errors**: `TALOS_INVALID_CAPABILITY` if expired or malformed

#### `authorize_fast(token: CapabilityToken, tool: string, action: string) -> bool` [Required]
- **Inputs**: Token, tool name, action name
- **Outputs**: `true` if scope permits tool:action
- **Errors**: `TALOS_DENIED` if not authorized

---

## Module: Frame Codec

#### `Frame.encode(payload: bytes, frame_type: FrameType) -> bytes` [Required]
- **Inputs**: Payload bytes, frame type enum
- **Outputs**: Wire-format frame bytes
- **Determinism**: Deterministic
- **Errors**: `TALOS_FRAME_INVALID`

#### `Frame.decode(data: bytes) -> (Frame, remaining: bytes)` [Required]
- **Inputs**: Wire bytes (may contain multiple frames)
- **Outputs**: Parsed frame and unconsumed bytes
- **Errors**: `TALOS_FRAME_INVALID` on truncation or garbage

---

## Module: MCP Security

#### `sign_mcp_request(wallet, request, session_id, correlation_id, tool, action) -> SignedFrame` [Required]
- **Inputs**: 
  - `wallet`: Signing identity
  - `request`: MCP request object (canonical JSON)
  - `session_id`: string
  - `correlation_id`: string
  - `tool`: string
  - `action`: string
- **Outputs**: Signed frame with MCP payload
- **Determinism**: Deterministic (same inputs = same signature)
- **Errors**: `TALOS_CRYPTO_ERROR`

#### `verify_mcp_response(frame, expected_correlation_id) -> bool` [Required]
- **Inputs**: Signed response frame, expected correlation ID
- **Outputs**: `true` if valid
- **Errors**: `TALOS_FRAME_INVALID`, `TALOS_DENIED`

---

## Module: Transport

#### `Client.connect(gateway_url: string, wallet: Wallet) -> Client` [Required]
- **Inputs**: Gateway WebSocket URL, identity wallet
- **Outputs**: Connected client instance
- **Protocol Negotiation**: Client sends protocol version, validates server response
- **Errors**: `TALOS_TRANSPORT_TIMEOUT`, `TALOS_PROTOCOL_MISMATCH`

#### `client.send(frame: Frame) -> void` [Required]
- **Inputs**: Frame to send
- **Errors**: `TALOS_TRANSPORT_TIMEOUT`

#### `client.close() -> void` [Required]
- Graceful connection close

#### `client.protocol_version() -> string` [Required]
- **Outputs**: Negotiated protocol version string

#### `client.supported_protocol_range() -> (min: string, max: string)` [Required]
- **Outputs**: SDK's supported protocol range

---

## Module: Session [Optional v1.0]

#### `seal_message(message: bytes, session_key: bytes) -> bytes` [Optional]
- AEAD encryption with session key
- **Determinism**: Non-deterministic (random nonce)

#### `unseal_message(ciphertext: bytes, session_key: bytes) -> bytes` [Optional]
- **Errors**: `TALOS_CRYPTO_ERROR` on auth failure

---

## Module: Audit [Post-v1]

#### `hash_commit(event: AuditEvent) -> bytes[32]` [Post-v1]
- Canonical hash of audit event

#### `verify_commit(event: AuditEvent, hash: bytes) -> bool` [Post-v1]
- Verify hash matches event

---

## Facade: TalosClient

The high-level facade that composes all modules.

```
class TalosClient:
    wallet: Wallet
    client: Client
    
    constructor(gateway_url: string, wallet: Wallet)
    connect() -> void
    sign_and_send_mcp(request, tool, action) -> Response
    close() -> void
    protocol_version() -> string
```

All Required module methods must be accessible through the facade or directly importable.

---

## Encoding Rules

See `CANONICAL_JSON.md` for JSON canonicalization rules.

### Key Serialization
- Public keys: 32 bytes, serialized as **base64url** (no padding)
- Signatures: 64 bytes, serialized as **base64url** (no padding)
- Hashes: 32 bytes, serialized as **hex** (lowercase)

### String Encoding
- All strings are UTF-8
- DID format: `did:key:z6Mk<base58btc-encoded-public-key>`
