# CLAUDE.md - Contracts Submodule

This file provides guidance to Claude Code (claude.ai/code) when working with the contracts submodule of the Talos Protocol.

## Overview

The `contracts/` submodule is the single source of truth for all protocol specifications, JSON schemas, test vectors, and reference implementations. It defines the interface that all SDKs must implement across languages (Python, TypeScript, Java, Go).

## Repository Structure

Key directories and files within the contracts submodule include:

- `assets/schemas/` - Complete collection of JSON schemas organized by domain
  - `a2a/` - Agent-to-Agent communication schemas
  - `crypto/` - Cryptographic primitive schemas
  - `rbac/` - Role-Based Access Control schemas
  - `mcp/` - Model Connector Protocol schemas
  - `ai_gateway/` - AI Gateway schemas
- `assets/vectors/` - Test vectors for validation
- `typescript/` - TypeScript implementation and test vectors
- `python/` - Python implementation and test vectors
- `docs/` - Documentation and architectural decision records

## Common Development Commands

### Validation and Testing
```bash
# Validate JSON schemas
make typecheck

# Run contract validation tests
make test

# Run cross-language compatibility tests
make interop

# Run TypeScript-specific tests
cd typescript && npm test

# Run Python-specific tests
cd python && python -m pytest
```

### Schema Management
```bash
# Generate new schemas (if applicable)
# Follow specific generator patterns in tools/

# Validate schema changes
make typecheck
```

## Architecture Guidelines

1. **Schema-First Development**: All data structures and interfaces must be defined as JSON schemas before implementation.

2. **Language Agnostic**: Schemas must work across all supported languages (TypeScript, Python, Java, Go).

3. **Test Vector Coverage**: Every schema should have corresponding test vectors to validate implementations.

4. **Backward Compatibility**: Schema changes must maintain backward compatibility or follow explicit versioning.

5. **Canonical Representation**: All schemas should define canonical representations for deterministic serialization.

## TypeScript Component Patterns

The TypeScript component (`contracts/typescript/`) includes:

- Schema validation and type generation
- Reference implementations of core algorithms
- Comprehensive test vectors for validation
- Canonical JSON serialization utilities

Key files:
- `src/` - Core TypeScript implementation
- `assets/test_vectors/` - TypeScript-specific test vectors
- `test/` - Validation tests

## Python Component Patterns

The Python component (`contracts/python/`) includes:

- Schema validation and type definitions
- Reference implementations of core algorithms
- Comprehensive test vectors for validation

Key files:
- `talos_contracts/` - Core Python package
- `assets/schemas/` - JSON schemas organized by domain
- `assets/vectors/` - Test vectors for validation

## Key Validation Scripts

- `make test` - Run all contract validation tests
- `make typecheck` - Validate JSON schema integrity
- `make interop` - Cross-language compatibility tests
- `scripts/test.sh` - Main test entrypoint

## Development Workflow for Contracts

1. Define or modify JSON schemas in `assets/schemas/`
2. Create or update corresponding test vectors
3. Validate schemas with `make typecheck`
4. Run tests with `make test`
5. Verify cross-language compatibility with `make interop`
6. Update reference implementations in both TypeScript and Python components
7. Ensure all tests pass before committing changes

## Important Notes for Contract Changes

- All schema changes affect multiple SDK implementations
- Test vectors must be updated when schemas change
- Cross-language compatibility is critical
- Backward compatibility must be maintained or explicitly versioned
- Changes should be validated against all SDK implementations