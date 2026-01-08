# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-01-08

### Changed

- **Internal**: Refactored to hexagonal architecture (`domain/`, `infrastructure/` layers)
- **Packaging**: Removed `src` from published files (now ships `dist` only)
- **Packaging**: Explicitly blocked deep imports via `exports` map (`"./*": null`)
- **Packaging**: Added `sideEffects: false` for tree-shaking support

### Added

- Golden test vectors (`test/vectors/golden.json`) for cross-language compatibility
- Consumer smoke test (`scripts/smoke-test.mjs`) for CI validation
- API snapshot testing to detect accidental type changes

### Fixed

- N/A

### Security

- N/A

### Deprecated

- Internal compatibility shims (e.g., `src/base64url.ts`) will be removed in v2.0

> **Note**: Public API remains unchanged. This is an internal refactor only.

## [1.1.0] - 2026-01-07

### Added

- Initial release of `@talosprotocol/contracts`
- Base64url encoding/decoding utilities
- UUIDv7 validation
- Cursor derivation, decoding, and comparison
- Cursor invariant validation
- Cursor continuity checking
- Event ordering comparison
- Event and gateway redaction
- Evidence bundle creation
