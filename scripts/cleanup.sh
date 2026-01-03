#!/usr/bin/env bash
set -euo pipefail

# talos-contracts cleanup script
# Removes all dependencies and generated files

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Cleaning talos-contracts..."

cd "$REPO_DIR"

# TypeScript
rm -rf typescript/dist
rm -rf typescript/node_modules
rm -rf typescript/.tsbuildinfo

# Python
rm -rf python/*.egg-info
rm -rf python/build
rm -rf python/dist
rm -rf python/.pytest_cache
find python -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find python -name "*.pyc" -delete 2>/dev/null || true

# Common
rm -rf .ruff_cache
rm -rf .pytest_cache

echo "✓ talos-contracts cleaned"
