# Talos Hashing Specification v1.0

## Schedule Hash Algorithm

**Used for**: Linking vectors and SDK conformance output to the exact KDF schedule version.

| Field | Value |
|-------|-------|
| Algorithm | SHA-256 |
| Input | UTF-8 bytes of canonical JSON of `ratchet_kdf_schedule.json` |
| Encoding | base64url no padding |

## Worked Example

### Input: `ratchet_kdf_schedule.json`
```json
{"$schema":"http://json-schema.org/draft-07/schema#","aead":{"aad_mode":"header_canonical_json_bytes","algorithm":"ChaCha20-Poly1305","nonce_len":12,"tag_len":16},"constants":{"CHAIN_KEY_LEN":32,"MAX_SKIP":1000,"MESSAGE_KEY_LEN":32,"NONCE_LEN":12,"ROOT_KEY_LEN":32},"kdf_steps":{"kdf_ck_chain":{"description":"Derive next chain key","ikm_mode":"ck","ikm_note":"Current chain key (32 bytes)","info_utf8":"talos-double-ratchet-chain","name":"chain_kdf","out_len":32,"salt_mode":"none","salt_note":"No salt (empty bytes)","split":{"next_chain_key":{"length":32,"offset":0}}},"kdf_ck_message":{"description":"Derive message key from chain key","ikm_mode":"ck","ikm_note":"Current chain key (32 bytes)","info_utf8":"talos-double-ratchet-message","name":"message_kdf","out_len":32,"salt_mode":"none","salt_note":"No salt (empty bytes)","split":{"message_key":{"length":32,"offset":0}}},"kdf_rk":{"description":"Derive new root key and chain key from DH output","ikm_mode":"concat(rk, dh_out)","ikm_note":"Concatenate root key (32 bytes) + DH output (32 bytes)","info_utf8":"talos-double-ratchet-root","name":"root_kdf","out_len":64,"salt_mode":"none","salt_note":"No salt (empty bytes)","split":{"chain_key":{"length":32,"offset":32},"root_key":{"length":32,"offset":0}}},"x3dh_init":{"description":"Derive initial root key from X3DH shared secret","ikm_mode":"raw_shared_secret","ikm_note":"X3DH shared secret (typically 96-128 bytes)","info_utf8":"x3dh-init","name":"initial_root_kdf","out_len":32,"salt_b64u":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","salt_mode":"explicit","salt_note":"32 zero bytes","split":{"root_key":{"length":32,"offset":0}}}},"protocol":"talos-double-ratchet","title":"Talos Ratchet KDF Schedule v1.1","version":"1.1.0"}
```

### Computation Steps
1. **Canonical JSON bytes** (UTF-8): `1847 bytes`
2. **SHA-256 hash** (hex): `<computed at runtime>`
3. **Base64URL no padding**: `<computed at runtime>`

> **Note**: SDKs must compute the schedule hash using the exact canonical JSON bytes, not the pretty-printed file. Use `canonical_json_bytes(schedule_obj)` from the contracts artifact.

## SDK Conformance Output

Every SDK conformance runner must print:

```
SCHEDULE_HASH=<base64url_no_padding>
```

The conformance harness compares this to the `schedule_hash` field in vectors.
