# Talos Security Best Practices

## Canonical JSON Integrity
The canonical JSON representation of a capability is **integrity-critical**. 
- **DO NOT** use generic JSON serializers without verifying they sort keys lexicographically.
- **DO NOT** add whitespace outside of string values.
- **DO verify** that `marshal(marshal(obj))` is idempotent.

## Key Handling
- **Ed25519 Private Keys**: Must be 32 bytes.
- **Storage**: Never store private keys in plain text. Use OS keystores or HSMs where possible.
- **Memzero**: implementations should attempt to zero out private key memory after use (best effort in GC languages).

## Error Payloads
- **No Stack Traces**: Error details sent over the wire must never contain stack traces.
- **Safe Messages**: Messages should be opaque or generic to prevent leaking validation logic details.
