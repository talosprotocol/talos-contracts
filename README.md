# Talos Protocol Contracts

> **The source of truth for Talos Protocol schemas, types, and helper functions.**

## Overview

This repository contains the shared kernel for the Talos Protocol ecosystem:

- **Schemas**: JSON Schema definitions for audit events, gateway status, etc.
- **Test Vectors**: Golden files for cross-language validation
- **TypeScript Package**: `@talos-protocol/contracts`
- **Python Package**: `talos-contracts`

## Philosophy

> **Contract-Driven Kernel**: All cursor, ordering, and integrity logic lives here. Consumer repos import helpers, never re-implement.

## Packages

### TypeScript

```bash
cd typescript
npm install
npm test
npm run build
```

### Python

```bash
cd python
pip install -e ".[dev]"
pytest
```

## Helper Functions

| Function | Description |
|----------|-------------|
| `deriveCursor(timestamp, eventId)` | Derive cursor from timestamp and event ID |
| `decodeCursor(cursor)` | Decode cursor to { timestamp, event_id } |
| `compareCursor(a, b)` | Compare two cursors (-1, 0, 1) |
| `assertCursorInvariant(event)` | Validate event cursor matches derived |
| `isUuidV7(id)` | Check if string is valid UUIDv7 |
| `base64urlEncode/Decode` | Strict base64url (no padding) |
| `orderingCompare(a, b)` | Event ordering (timestamp DESC, event_id DESC) |

## Test Vectors

Located in `test_vectors/`:

- `cursor_derivation.json` - Cursor derivation goldens
- `base64url.json` - Base64url encoding/decoding cases
- `uuidv7.json` - UUIDv7 validation cases
- `ordering.json` - Event ordering comparison cases

## Spec Clarifications

### Cursor Derivation

```
cursor = base64url(utf8("{timestamp}:{event_id}"))
```

- `timestamp`: integer seconds, base-10 ASCII, no leading zeros (except "0")
- `event_id`: UUIDv7 lowercase canonical form
- `base64url`: URL-safe alphabet, **NO padding**

### Ordering

```
(timestamp DESC, event_id DESC)
```

Higher timestamp first, then higher event_id (lexicographic).

## License

MIT
