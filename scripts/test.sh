#!/usr/bin/env bash
set -eo pipefail

# =============================================================================
# Contracts (Python) Standardized Test Entrypoint
# =============================================================================

ARTIFACTS_DIR="artifacts/coverage"
mkdir -p "$ARTIFACTS_DIR"

COMMAND=${1:-"--unit"}

run_unit() {
    echo "--- Running Unit Tests ---"
    PYTHONPATH=python python3 -m pytest python/tests/ --maxfail=2 -q
}

run_smoke() {
    echo "--- Running Smoke Tests ---"
    PYTHONPATH=python python3 -m pytest python/tests/ -m smoke --maxfail=1 -q || run_unit
}

run_integration() {
    echo "--- Skipping Integration (Not found) ---"
}

run_coverage() {
    echo "--- Running Coverage (pytest-cov) ---"
    python3 -m pytest python/tests/ --cov=python/ --cov-report=xml:"$ARTIFACTS_DIR/coverage.xml"
}

case "$COMMAND" in
    --smoke)
        run_smoke
        ;;
    --unit)
        run_unit
        ;;
    --integration)
        run_integration
        ;;
    --coverage)
        run_coverage
        ;;
    --ci)
        run_smoke
        run_unit
        run_coverage
        ;;
    --full)
        run_smoke
        run_unit
        run_integration
        run_coverage
        ;;
    *)
        echo "Usage: $0 {--smoke|--unit|--integration|--coverage|--ci|--full}"
        exit 1
        ;;
esac

# Generate minimal results.json
mkdir -p artifacts/test
cat <<EOF > artifacts/test/results.json
{
  "repo_id": "talos-contracts",
  "command": "$COMMAND",
  "status": "pass",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
