# Talos SDK Code Coverage Rules

This document defines the **binding rules** for code coverage across all Talos SDKs. Ideally, all SDKs should aim for 100% coverage, but the following thresholds are enforced by CI.

## 1. Thresholds

| Scope | Threshold | Description |
| :--- | :--- | :--- |
| **Overall** | **≥ 80%** | The aggregate coverage of the entire library source code. |
| **Core Modules** | **≥ 90%** | Critical security/protocol logic (see below). |

## 2. Core Modules
Core modules are defined as any code handling:
- Cryptographic primitives (`ed25519`, `x25519`, `aes-gcm`, `chacha20poly1305`, `hkdf`).
- Double Ratchet Protocol (`RatchetSession`, `RatchetState`).
- Wallet & Key Management (`Wallet`, `Identity`).
- Canonical JSON Serialization (`canonical_json`).
- MCP Framing & Signing.

**Disallowed Exclusions**: You may NOT exclude these files from coverage reports.

## 3. Allowed Exclusions
The following paths may be excluded from coverage metrics:
- **Generated Code**: Protobuf bindings, auto-generated SDK wrappers.
- **Examples**: `examples/` directories.
- **Test Harnesses**: Conformance runners or CLI wrappers used solely for testing (`cmd/`, `test/harness`).
- **Mocks**: Test utilities and mock objects.

## 4. Standard Tooling
All SDKs must use the following approved coverage tools:

| Language | Tool | Output Format |
| :--- | :--- | :--- |
| **Python** | `pytest-cov` | `coverage.xml`, `htmlcov/` |
| **TypeScript** | `vitest` (v8) | `coverage/lcov.info` |
| **Go** | `go test -cover` | `coverage.out` |
| **Java** | `jacoco` | `target/site/jacoco/index.html` |
| **Rust** | `cargo-llvm-cov` | `lcov.info` |

## 5. CI Requirements
Every CI run must:
1. Run `make coverage`.
2. Run `make coverage-check` (fails if thresholds are missed).
3. **Upload Artifacts**: The full report must be attached to the workflow run.
4. **Print Summary**: A log line `COVERAGE_TOTAL=<pct>` should be visible.
