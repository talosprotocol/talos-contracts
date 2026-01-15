import json
from pathlib import Path

import pytest

from talos_contracts.infrastructure.canonical import calculate_digest

ROOT = Path(__file__).resolve().parents[2]
VECTOR_PATH = ROOT / "test_vectors" / "tga" / "golden_trace_chain.json"


@pytest.fixture
def golden_chain():
    with open(VECTOR_PATH) as f:
        return json.load(f)


def test_action_request_digest_parity(golden_chain):
    ar = golden_chain["action_request"]
    assert calculate_digest(ar) == ar["_digest"]


def test_supervisor_decision_digest_parity(golden_chain):
    sd = golden_chain["supervisor_decision"]
    assert calculate_digest(sd) == sd["_digest"]


def test_tool_call_digest_parity(golden_chain):
    tc = golden_chain["tool_call"]
    assert calculate_digest(tc) == tc["_digest"]


def test_tool_effect_digest_parity(golden_chain):
    te = golden_chain["tool_effect"]
    assert calculate_digest(te) == te["_digest"]
