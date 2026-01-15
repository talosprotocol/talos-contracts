import json
import hashlib
from datetime import datetime, timezone

def canonical_json_bytes(data: any) -> bytes:
    return json.dumps(
        data,
        sort_keys=True,
        separators=(',', ':'),
        ensure_ascii=False
    ).encode('utf-8')

def calculate_digest(data: dict) -> str:
    clean_data = data.copy()
    if "_digest" in clean_data:
        del clean_data["_digest"]
    return hashlib.sha256(canonical_json_bytes(clean_data)).hexdigest()

def generate_chain():
    trace_id = "01946896-1234-7567-89ab-000000000000"
    plan_id = "01946896-1234-7567-89ab-000000000001"
    agent_id = "01946896-1234-7567-89ab-00000000000a"
    supervisor_id = "01946896-1234-7567-89ab-00000000000b"
    
    # 1. Action Request
    ar = {
        "schema_id": "talos.tga.action_request",
        "schema_version": "tga.v1",
        "trace_id": trace_id,
        "plan_id": plan_id,
        "action_request_id": "01946896-1234-7567-89ab-000000001000",
        "agent_id": agent_id,
        "ts": "2026-01-15T14:45:00.000Z",
        "risk_level": "WRITE",
        "intent": "Apply security patch to the authentication module branch.",
        "resources": [
            {"kind": "repo", "id": "talosprotocol/talos-ai-gateway"}
        ],
        "proposal": {
            "tool_server": "mcp-github",
            "tool_name": "create-branch",
            "args": {"name": "fix/auth-vuln-1"}
        },
        "_digest_alg": "sha256"
    }
    ar["_digest"] = calculate_digest(ar)
    
    # 2. Supervisor Decision
    sd = {
        "schema_id": "talos.tga.supervisor_decision",
        "schema_version": "tga.v1",
        "trace_id": trace_id,
        "plan_id": plan_id,
        "supervisor_decision_id": "01946896-1234-7567-89ab-000000002000",
        "action_request_id": ar["action_request_id"],
        "action_request_digest": ar["_digest"],
        "ts": "2026-01-15T14:50:00.000Z",
        "decision": "APPROVE",
        "rationale": "High-risk action approved following manual audit of the patch plan.",
        "minted_capability": "eyJhbGciOiJFZERTQSIsImtpZCI6InN1cGVydmlzb3IifQ.eyJhdWQiOiJ0YWxvcy1nYXRld2F5In0.fake_sig",
        "_digest_alg": "sha256"
    }
    sd["_digest"] = calculate_digest(sd)
    
    # 3. Tool Call
    tc = {
        "schema_id": "talos.tga.tool_call",
        "schema_version": "tga.v1",
        "trace_id": trace_id,
        "plan_id": plan_id,
        "tool_call_id": "01946896-1234-7567-89ab-000000003000",
        "supervisor_decision_id": sd["supervisor_decision_id"],
        "supervisor_decision_digest": sd["_digest"],
        "capability_digest": "79de091217e47dfa93144a170889e49622d952227d82cc785e05a2cd06f8510a", # Hash of the capability string
        "ts": "2026-01-15T14:55:00.000Z",
        "call": {
            "tool_server": "mcp-github",
            "tool_name": "create-branch",
            "args": {"name": "fix/auth-vuln-1"}
        },
        "idempotency_key": "fixed-idempotency-auth-1",
        "_digest_alg": "sha256"
    }
    tc["_digest"] = calculate_digest(tc)
    
    # 4. Tool Effect
    te = {
        "schema_id": "talos.tga.tool_effect",
        "schema_version": "tga.v1",
        "trace_id": trace_id,
        "plan_id": plan_id,
        "tool_effect_id": "01946896-1234-7567-89ab-000000004000",
        "tool_call_id": tc["tool_call_id"],
        "tool_call_digest": tc["_digest"],
        "ts": "2026-01-15T14:57:00.000Z",
        "outcome": {
            "status": "SUCCESS",
            "summary": "Branch successfully created in GitHub.",
            "external_refs": [
                {"kind": "commit_sha", "id": "da39a3ee5e6b4b0d3255bfef95601890afd80709"}
            ]
        },
        "_digest_alg": "sha256"
    }
    te["_digest"] = calculate_digest(te)
    
    chain = {
        "action_request": ar,
        "supervisor_decision": sd,
        "tool_call": tc,
        "tool_effect": te
    }
    
    print(json.dumps(chain, indent=2))

if __name__ == "__main__":
    generate_chain()
