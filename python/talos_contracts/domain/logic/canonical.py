"""Canonical JSON logic."""

from typing import Any

def strip_nulls(data: Any) -> Any:
    """
    Recursively remove keys with None values from dicts.
    Required for contract-compliant canonical JSON where nulls should be absent.
    """
    if isinstance(data, dict):
        return {
            k: strip_nulls(v)
            for k, v in data.items()
            if v is not None
        }
    elif isinstance(data, list):
        return [strip_nulls(v) for v in data]
    return data
