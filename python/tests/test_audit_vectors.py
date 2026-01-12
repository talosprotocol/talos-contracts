import hashlib
import hmac
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
VECTOR_PATH = ROOT / "test_vectors" / "audit_event_vectors.json"

def jcs(obj):
    """RFC 8785 like canonicalization."""
    return json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')

def hmac_sha256(key, message):
    return hmac.new(key.encode('utf-8'), message.encode('utf-8'), hashlib.sha256).hexdigest()

@pytest.fixture
def audit_vectors():
    with open(VECTOR_PATH) as f:
        return json.load(f)["tests"]

def test_audit_vectors_cross_language(audit_vectors):
    for tc in audit_vectors:
        # 1. Canonicalization Check
        canonical_bytes = jcs(tc["event_without_hash"])
        assert canonical_bytes.hex() == tc["canonical_bytes_hex"], f"Canonical mismatch in {tc['name']}"
        
        # 2. Hash Check
        expected_hash = hashlib.sha256(canonical_bytes).hexdigest()
        assert expected_hash == tc["event_hash"], f"Hash mismatch in {tc['name']}"
        
        # 3. HMAC IP Check (if applicable)
        ic = tc.get("input_context")
        if ic and ic.get("client_ip") and ic.get("ip_hmac_key"):
            actual_ip_hash = hmac_sha256(ic["ip_hmac_key"], ic["client_ip"])
            assert actual_ip_hash == tc["event_without_hash"]["http"]["client_ip_hash"]

def test_meta_filtering_consistency(audit_vectors):
    """Verify that disallowed meta keys are filtered out BEFORE hashing."""
    case = next(t for t in audit_vectors if t["name"] == "failure_meta_filtered")
    
    # In real implementation, we filter 'unfiltered' to get 'filtered'
    # Here we just verify that the 'event_without_hash' in vector IS filtered
    assert "secret_key" not in case["event_without_hash"]["meta"]
    assert case["event_without_hash"]["meta"]["error"] == "Timeout"
