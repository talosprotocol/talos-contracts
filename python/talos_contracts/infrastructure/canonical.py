import hashlib
import json
from typing import Any, Optional, List


def _normalize_numbers(data: Any) -> Any:
    if isinstance(data, dict):
        return {key: _normalize_numbers(value) for key, value in data.items()}
    if isinstance(data, list):
        return [_normalize_numbers(value) for value in data]
    if isinstance(data, float) and data.is_integer():
        return int(data)
    return data


def canonical_json_bytes(data: Any) -> bytes:
    """
    Serializes a value to canonical JSON bytes according to RFC 8785.
    - Keys sorted alphabetically.
    - No whitespace in separators.
    - UTF-8 encoding.
    """
    normalized = _normalize_numbers(data)
    return json.dumps(normalized, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode(
        "utf-8"
    )


def calculate_digest(data: dict[str, Any], exclude_fields: Optional[List[str]] = None) -> str:
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
