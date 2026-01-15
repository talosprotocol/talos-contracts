import hashlib
import json

def canonical_json_bytes(data: any) -> bytes:
    """
    Serializes a value to canonical JSON bytes according to RFC 8785.
    - Keys sorted alphabetically.
    - No whitespace in separators.
    - UTF-8 encoding.
    """
    return json.dumps(
        data,
        sort_keys=True,
        separators=(',', ':'),
        ensure_ascii=False
    ).encode('utf-8')

def calculate_digest(data: dict, exclude_fields: list[str] = None) -> str:
    """
    Calculates SHA-256 digest of an object after canonicalization.
    Optionally excludes specific fields (e.g., '_digest').
    """
    if exclude_fields is None:
        exclude_fields = ["_digest"]
        
    clean_data = data.copy()
    for field in exclude_fields:
        if field in clean_data:
            del clean_data[field]
            
    bytes_data = canonical_json_bytes(clean_data)
    return hashlib.sha256(bytes_data).hexdigest()
