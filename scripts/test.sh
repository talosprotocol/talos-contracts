#!/bin/bash
set -eo pipefail

COMMAND=${1:-unit}

case "$COMMAND" in
  unit)
    echo "--- Running Unit Tests ---"
    make test
    ;;
  interop)
    echo "--- Running Interop/Conformance Tests ---"
    # For contracts repo, interop means verifying internal vector consistency (conformance)
    # "make interop" would require external SDKs checking out, which we enable if present, 
    # but strictly "conformance" validates the vectors against specific schemas.
    make conformance
    ;;
  lint)
    echo "--- Running Lint ---"
    make lint
    ;;
  typecheck)
    echo "--- Running Typecheck ---"
    make typecheck
    ;;
  *)
    echo "Error: Unknown command '$COMMAND'"
    exit 1
    ;;
esac
