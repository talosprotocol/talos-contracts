"""Identity and RBAC schema validation tests."""

import json
from pathlib import Path

import pytest

try:
    from jsonschema import Draft7Validator
except ImportError:
    pytest.skip("jsonschema not installed", allow_module_level=True)

ROOT = Path(__file__).resolve().parents[2]
SCHEMAS_DIR = ROOT / "schemas" / "rbac"
VECTORS_DIR = ROOT / "test_vectors" / "sdk"


def load_schema(name: str) -> dict:
    """Load a schema by name from the rbac directory."""
    return json.loads((SCHEMAS_DIR / f"{name}.schema.json").read_text())


def load_vectors() -> list:
    """Load identity validation vectors."""
    data = json.loads((VECTORS_DIR / "identity_validation.json").read_text())
    return data["vectors"]


@pytest.mark.parametrize("vector", load_vectors(), ids=lambda v: v["id"])
def test_identity_validation(vector):
    """Validate identity vectors against their schemas."""
    schema = load_schema(vector["schema"])
    validator = Draft7Validator(schema)

    errors = list(validator.iter_errors(vector["data"]))
    is_valid = len(errors) == 0

    assert is_valid == vector["valid"], f"Expected valid={vector['valid']}, got errors: {errors}"
