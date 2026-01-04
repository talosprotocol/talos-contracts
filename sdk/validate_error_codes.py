#!/usr/bin/env python3
"""Validates that SDK error codes match the canonical taxonomy."""
import json
import sys
from pathlib import Path

TAXONOMY_FILE = Path(__file__).parent / "error_codes.json"

def load_valid_codes() -> set[str]:
    with open(TAXONOMY_FILE) as f:
        data = json.load(f)
    return set(data["all_codes"])

def validate_sdk_codes(sdk_codes: list[str]) -> list[str]:
    valid = load_valid_codes()
    invalid = [c for c in sdk_codes if c not in valid]
    return invalid

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: validate_error_codes.py <codes_json_file>")
        sys.exit(1)
    
    with open(sys.argv[1]) as f:
        sdk_codes = json.load(f)
    
    invalid = validate_sdk_codes(sdk_codes)
    if invalid:
        print(f"ERROR: Invalid codes found: {invalid}")
        sys.exit(1)
    print("✓ All codes valid")
