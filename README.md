# Talos Contracts - Configuration Control Plane (v1)

This directory contains the canonical schemas, specifications, and helpers for the Talos Configuration Control Plane.

## Artifacts

### 1. JSON Schema

- **Path**: `schemas/config/v1/talos.config.schema.json`
- **Purpose**: Define the strict structure of the configuration file.
- **Validation**: `additionalProperties: false`, secrets must use `*_ref` suffix.

### 2. OpenAPI Specification

- **Path**: `openapi/configuration/v1/openapi.yaml`
- **Purpose**: Define the API surface for the `talos-configuration` BFF service.
- **Base Path**: `/api/config`

### 3. Canonicalization Helper

- **Path**: `jcs.py`
- **Purpose**: RFC 8785 JSON Canonicalization Scheme (JCS) implementation.
- **Guarantee**: Ensures deterministic config digests across implementation languages.

### 4. Examples

- `examples/config/v1/minimal.yaml`: Minimal valid configuration.
- `examples/config/v1/dev.yaml`: Typical local development setup.
- `examples/config/v1/production.yaml`: Production setup with secret references.

## Validation

Run schema validation and generate test vectors:

```bash
./scripts/validate.sh
```

## License

Licensed under the Apache License 2.0. See [LICENSE](../LICENSE).
