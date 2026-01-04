# Talos Compatibility Hashing

To ensure SDKs are built against the correct version of the Talos Contracts, we enforce strict cryptographic binding using **Contract Hashes**.

## 1. The Source of Truth
The canonical source of truth for the protocol definitions is:
- **File**: `contract_manifest.json` (located in `talos-contracts` root or built artifact).
- **Format**: JSON containing the full contract definitions (Errors, Events, Methods, Types).

## 2. Hashing Algorithm
To compute the `CONTRACT_HASH`:

1. **Canonicalize**: Transform `contract_manifest.json` into its **Canonical JSON** representation.
    - Spec: [RFC 8785 (JCS)](https://tools.ietf.org/html/rfc8785).
    - If JCS unavailable: Standard Python/Node JSON dump with `sort_keys=True`, `separators=(',', ':')`, `ensure_ascii=False`.
2. **Hash**: Compute the **SHA-256** digest of the canonical bytes.
3. **Encode**: Encode the 32-byte digest using **Base64URL** (RFC 4648) with **NO Padding**.

### Example Implementation (Python)
```python
import hashlib
import json
import base64

def compute_hash(data: dict) -> str:
    # 1. Canonicalize
    canonical_bytes = json.dumps(
        data, 
        sort_keys=True, 
        separators=(',', ':'), 
        ensure_ascii=False
    ).encode("utf-8")
    
    # 2. Hash
    digest = hashlib.sha256(canonical_bytes).digest()
    
    # 3. Encode (Base64URL no padding)
    return base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")
```

## 3. Ratchet Schedule
If the SDK supports the Ratchet feature, it must also include a `schedule_hash`.
- **File**: `ratchet_kdf_schedule.json`.
- **Algorithm**: Same as above (JCS -> SHA256 -> Base64URL No Padding).
