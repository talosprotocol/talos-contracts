#!/usr/bin/env bash
set -eo pipefail

# =============================================================================
# Contracts (Python) Standardized Test Entrypoint
# =============================================================================

ARTIFACTS_DIR="artifacts/coverage"
mkdir -p "$ARTIFACTS_DIR"

COMMAND=${1:-"--unit"}
HOST_PYTHON="${TALOS_PYTHON:-python3}"
VENV_DIR=".venv-test"
PYTHONPATH_BASE="python${PYTHONPATH:+:$PYTHONPATH}"

pick_python() {
    local candidates=()
    if [[ -n "${TALOS_PYTHON:-}" ]]; then
        candidates+=("${TALOS_PYTHON}")
    fi
    candidates+=(python3 python3.14 python3.13 python3.12 python3.11 python3.10)

    local candidate
    for candidate in "${candidates[@]}"; do
        command -v "$candidate" >/dev/null 2>&1 || continue
        if "$candidate" - <<'PY' >/dev/null 2>&1
import sys
raise SystemExit(0 if sys.version_info >= (3, 10) else 1)
PY
        then
            echo "$candidate"
            return 0
        fi
    done

    echo "Talos contracts tests require Python >= 3.10. Set TALOS_PYTHON to a compatible interpreter." >&2
    exit 1
}

HOST_PYTHON="$(pick_python)"

ensure_virtualenv() {
    if [[ ! -x "$VENV_DIR/bin/python" ]]; then
        echo "Creating local contracts test virtualenv with $("$HOST_PYTHON" --version 2>&1)..."
        "$HOST_PYTHON" -m venv "$VENV_DIR"
    fi
}

ensure_virtualenv
PYTHON_BIN="$VENV_DIR/bin/python"

ensure_test_dependencies() {
    if PYTHONPATH="$PYTHONPATH_BASE" "$PYTHON_BIN" - <<'PY' >/dev/null 2>&1
import importlib.util

required = ["pytest", "pytest_cov", "talos_contracts"]
missing = [name for name in required if importlib.util.find_spec(name) is None]
raise SystemExit(0 if not missing else 1)
PY
    then
        return 0
    fi

    echo "Installing contracts test dependencies with $("$PYTHON_BIN" --version 2>&1)..."
    PIP_DISABLE_PIP_VERSION_CHECK=1 "$PYTHON_BIN" -m pip install -e "./python[dev]"
}

ensure_test_dependencies

run_unit() {
    echo "--- Running Unit Tests ---"
    PYTHONPATH="$PYTHONPATH_BASE" "$PYTHON_BIN" -m pytest python/tests/ --maxfail=2 -q
}

run_smoke() {
    echo "--- Running Smoke Tests ---"
    set +e
    PYTHONPATH="$PYTHONPATH_BASE" "$PYTHON_BIN" -m pytest python/tests/ -m smoke --maxfail=1 -q
    local status=$?
    set -e
    if [[ $status -eq 0 || $status -eq 5 ]]; then
        if [[ $status -eq 5 ]]; then
            echo "No smoke tests collected. Skipping."
        fi
        return 0
    fi
    return "$status"
}

run_integration() {
    echo "--- Skipping Integration (Not found) ---"
}

run_coverage() {
    echo "--- Running Coverage (pytest-cov) ---"
    PYTHONPATH="$PYTHONPATH_BASE" "$PYTHON_BIN" -m pytest python/tests/ --cov=talos_contracts --cov-report=xml:"$ARTIFACTS_DIR/coverage.xml"
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
