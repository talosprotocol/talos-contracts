# talos-contracts Architecture

## Overview
`talos-contracts` is the **Single Source of Truth** for the Talos Protocol. It defines schemas, test vectors, and shared helper functions that all other repositories consume.

## Internal Components

| Component | Language | Purpose |
|-----------|----------|---------|
| `typescript/src/cursor.ts` | TypeScript | Cursor derivation and comparison |
| `typescript/src/base64url.ts` | TypeScript | URL-safe Base64 encoding (no padding) |
| `typescript/src/ordering.ts` | TypeScript | Event ordering comparators |
| `python/talos_contracts/cursor.py` | Python | Cursor derivation (identical logic) |
| `python/talos_contracts/base64url.py` | Python | URL-safe Base64 encoding |
| `test_vectors/*.json` | JSON | Cross-language golden test data |

## External Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| (none) | - | This repo has no external Talos dependencies |

## Artifacts Published

| Artifact | Registry | Package Name |
|----------|----------|--------------|
| NPM Package | GitHub Packages | `@talosprotocol/contracts` |
| Python Package | PyPI | `talos-contracts` |
| Test Vectors | GitHub Releases | `test_vectors.tar.gz` |

## Boundary Rules
- ✅ This is the source of truth - implementations here are canonical
- ✅ All helpers must have corresponding test vectors
- ❌ No external Talos dependencies allowed

## Data Flow

```mermaid
graph TD
    Vectors[test_vectors/*.json] --> TS[TypeScript Implementation]
    Vectors --> PY[Python Implementation]
    TS --> NPM[@talosprotocol/contracts]
    PY --> PYPI[talos-contracts]
    NPM --> Consumers[Consumer Repos]
    PYPI --> Consumers
```
