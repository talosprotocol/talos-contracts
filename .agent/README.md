# Agent workspace: contracts
> **Project**: contracts

This folder contains agent-facing context, tasks, workflows, and planning artifacts for this submodule.

## Current State
Source of truth for schemas and contract-first invariants. Capability auth, RBAC, TGA, and A2A phase specs are active. Schemas, OpenAPI, and test vectors are treated as normative integration boundaries.

## Expected State
Strict backward compatibility and versioned evolution. All new protocol or API features start here first. Consumers must not reimplement contract logic.

## Behavior
Defines JSON Schemas, OpenAPI specs, error codes, and cross-language test vectors. Publishes artifacts that all SDKs and services must comply with.

## How to work here
- Run/tests:
- Local dev:
- CI notes:

## Interfaces and dependencies
- Owned APIs/contracts:
- Depends on:
- Data stores/events (if any):

## Global context
See `.agent/context.md` for monorepo-wide invariants and architecture.
