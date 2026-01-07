# =============================================================================
# talos-contracts Test Script
# =============================================================================
set -euo pipefail

log() { printf '%s\n' "$*"; }
info() { printf 'ℹ️  %s\n' "$*"; }

info "Testing talos-contracts..."

# TypeScript tests (run in subshell to preserve cwd)
info "--- TypeScript ---"
(
  cd typescript
  npm ci --silent
  npm run lint 2>/dev/null || true
  npm run typecheck 2>/dev/null || npm run build
  npm test -- --run
  npm run build
)

# Python tests (run in subshell to preserve cwd)
info "--- Python ---"
(
  cd python
  pip install -e . -q
  ruff check talos_contracts tests 2>/dev/null || true
  ruff format --check talos_contracts tests 2>/dev/null || true
  pytest tests/ -q
)

log "✓ talos-contracts tests passed."
