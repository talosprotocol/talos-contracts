# Talos Double Ratchet Specification (v1.1)

This document defines the formal cryptographic schedule and wire format for the Talos Double Ratchet implementation. All SDKs must match these byte-for-byte to ensure interoperability.

## 1. Key Derivation Functions (KDFs)

All KDF operations use **HKDF-SHA256**.

### 1.1 Root Key Derivation (X3DH)
The initial root key (`RK`) is derived from a simplified X3DH handshake.
- **Handshake**: `dh_x3dh = DH(Alice_Ephem, Bob_SignedPrekey)`
- **IKM**: `dh_x3dh`
- **Salt**: `None`
- **Info**: `b"x3dh-init"`
- **Length**: 32 bytes

### 1.2 Root Chain Ratchet (KDF_RK)
Derives a new Root Key and a new Chain Key (Sending or Receiving).
- **IKM**: `concat(rk, dh_out)`  (Note: Root Key is concatenated with DH output)
- **Salt**: `None`
- **Info**: `b"talos-double-ratchet-root"`
- **Length**: 64 bytes
- **Output**: `RK_new = output[0:32]`, `CK_new = output[32:64]`

### 1.3 Symmetric Chain Ratchet (KDF_CK)
Derives a Message Key (`MK`) and the next Chain Key (`CK`).
- **Message Key Derivation**:
  - **IKM**: `ck`
  - **Salt**: `None`
  - **Info**: `b"talos-double-ratchet-message"`
  - **Length**: 32 bytes
- **Next Chain Key Derivation**:
  - **IKM**: `ck`
  - **Salt**: `None`
  - **Info**: `b"talos-double-ratchet-chain"`
  - **Length**: 32 bytes

---

## 2. Message Encoding

### 2.1 Header Structure
The header MUST be serialized using **Talos Canonical JSON (RFC 8785)**.
Required fields:
- `dh`: Base64URL-encoded ratchet public key (32 bytes).
- `pn`: Previous chain length (integer).
- `n`: Message number (integer).

Example: `{"dh":"...","n":0,"pn":0}`

### 2.2 Associated Data (AAD)
The **Associated Data** passed to the AEAD cipher MUST be the **raw canonical JSON header bytes** (no base64 wrapping).

---

## 3. Binary Wire Format (v1.1.0)
The Talos Ratchet message is wrapped in a **JSON envelope** before binary serialization to ensure cross-language parity of the top-level structure.

1. **Envelope Object**:
   ```json
   {
     "header": {"dh": "...", "pn": 0, "n": 0},
     "nonce": "Base64URL(12 bytes)",
     "ciphertext": "Base64URL(encrypted_bytes + tag)"
   }
   ```
2. **Wire Representation**:
   `wire_message_bytes = Talos_Canonical_JSON_Bytes(Envelope_Object)`
   `wire_message_b64u = Base64URL_No_Padding(wire_message_bytes)`

This format ensures that even the high-level framing is covered by the canonical JSON rules, preventing drift in field ordering or whitespace.

---

## 4. Cryptographic Primitives

- **DH**: X25519 (RFC 7748)
- **AEAD**: ChaCha20-Poly1305 (RFC 8439)
- **Hash**: SHA-256 (FIPS 180-4)
- **KDF**: HKDF-SHA256 (RFC 5869)
