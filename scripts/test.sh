#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# talos-contracts Test Script
# =============================================================================

echo "Testing talos-contracts..."

# TypeScript tests
echo "--- TypeScript ---"
cd typescript
npm ci --silent
npm run lint 2>/dev/null || true
npm run typecheck 2>/dev/null || npm run build
npm test -- --run
if [[ "${TALOS_SKIP_BUILD:-false}" != "true" ]]; then
  npm run build
fi
cd ..

# Python tests
echo "--- Python ---"
cd python
pip install -e . -q
ruff check talos_contracts tests 2>/dev/null || true
ruff format --check talos_contracts tests 2>/dev/null || true
pytest tests/ -q
cd ..

echo "talos-contracts tests passed."
