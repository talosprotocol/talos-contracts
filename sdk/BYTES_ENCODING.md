# Talos Byte Encoding Standards (v1.1)

To ensure interoperability between Python, TypeScript, Rust, Go, and Java, all binary data in JSON payloads must follow strict encoding rules.

## The Rule: Base64URL No Padding

**All byte arrays must be encoded as Base64URL strings with NO padding characters (`=`).**

- **Alphabet**: `A-Z`, `a-z`, `0-9`, `-`, `_`
- **Padding**: Strip `=` characters.
- **Decoding**: Implementations must accept padded or unpadded input, but **MUST** produce unpadded output.

### Rationale
- **URL Safe**: Can be used in headers and DIDs without escaping.
- **Compact**: Slight efficiency over standard Base64.
- **Standard**: RFC 4648 Section 5.

## Fields Mandating Bytes
The following fields in Ratchet schemas are always binary:
- `identity_key` (Ed25519 Public Key, 32 bytes)
- `signed_prekey` (X25519 Public Key, 32 bytes)
- `signature` (Ed25519/XEdDSA Signature, 64 bytes)
- `dh` (Ratchet Public Key, 32 bytes)
- `ciphertext` (ChaCha20-Poly1305 output)
- `nonce` (12 bytes)
- `aad` (Arbitrary length)
- `root_key`, `chain_key`, `message_key` (32 bytes)

## Incorrect Examples (DO NOT USE)
- `Hex`: `deadbeef...` (Too verbose)
- `Base64`: `deadbeef==` (Contains `+`, `/`, `=`)
- `Raw String`: `\xde\xad...` (Not JSON safe)

## Implementation Guide
- **Python**: `base64.urlsafe_b64encode(b).rstrip(b'=')`
- **Node**: `Buffer.toString('base64url')`
- **Rust**: `base64::engine::general_purpose::URL_SAFE_NO_PAD`
- **Go**: `base64.RawURLEncoding`
- **Java**: `Base64.getUrlEncoder().withoutPadding()`
