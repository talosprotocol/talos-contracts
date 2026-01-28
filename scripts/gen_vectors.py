
import sys
import os
import hashlib
import json

# Add parent dir to path to import jcs
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from jcs import canonicalize
except ImportError:
    # Fallback if running from wrong CWD
    sys.path.append(os.path.abspath("contracts"))
    from jcs import canonicalize

def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def generate():
    vectors = []

    # Case 1: Simple Tool Call
    v1_input = {
        "tool_call": {
            "server": "mcp-server-1",
            "tool": "calculator.add",
            "args": {"a": 10, "b": 20},
            "idempotency_key": "cmd-123"
        }
    }
    # Expected JCS: {"tool_call":{"args":{"a":10,"b":20},"idempotency_key":"cmd-123","server":"mcp-server-1","tool":"calculator.add"}}
    # Note: keys sorted: args, idempotency_key, server, tool.
    # Inside args: a, b.
    
    jcs_bytes = canonicalize(v1_input)
    vectors.append({
        "id": "vector_tool_call_simple",
        "description": "Simple tool call with integer args",
        "input_json": v1_input,
        "jcs_utf8_string": jcs_bytes.decode("utf-8"),
        "sha256_hex": sha256_hex(jcs_bytes)
    })

    # Case 2: Document (JSON)
    v2_input = {
        "doc_id": "doc-55",
        "content": {
            "title": "Test Document",
            "tags": ["security", "audit"],
            "meta": {"verified": True}
        }
    }
    jcs_bytes = canonicalize(v2_input)
    vectors.append({
        "id": "vector_doc_json",
        "description": "JSON document structure",
        "input_json": v2_input,
        "jcs_utf8_string": jcs_bytes.decode("utf-8"),
        "sha256_hex": sha256_hex(jcs_bytes)
    })

    # Case 3: Execution Log Entry (Payload in Digest)
    # Payload: {"trace_id": "t-1", "seq": 1, "type": "tool_call", "payload": {...}, "ts": "2026-01-27T12:00:00Z", "prev_digest": "0000..."}
    v3_payload = {
        "trace_id": "trace-999",
        "sequence_number": 1,
        "type": "tool_call",
        "payload": {"tool": "echo", "args": "hello"},
        "ts": "2026-01-27T12:00:00Z",
        "prev_entry_digest": "0000000000000000000000000000000000000000000000000000000000000000"
    }
    jcs_bytes = canonicalize(v3_payload)
    vectors.append({
        "id": "vector_execution_log_entry",
        "description": "Execution Log Entry with payload included",
        "input_json": v3_payload,
        "jcs_utf8_string": jcs_bytes.decode("utf-8"),
        "sha256_hex": sha256_hex(jcs_bytes)
    })

    output = {
        "version": "1.0",
        "generated_at": "2026-01-27T12:00:00Z",
        "vectors": vectors
    }
    
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    generate()
