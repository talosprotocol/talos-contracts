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
rm -rf typescript/.tsbuildinfo typescript/*.tsbuildinfo
rm -rf typescript/coverage 2>/dev/null || true
rm -f typescript/lcov.info typescript/coverage.xml typescript/junit.xml 2>/dev/null || true

# Python
rm -rf python/*.egg-info
rm -rf python/build
rm -rf python/dist
rm -rf python/.pytest_cache
rm -f python/.coverage python/coverage.xml python/conformance.xml 2>/dev/null || true
rm -rf python/htmlcov python/coverage 2>/dev/null || true
find python -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find python -name "*.pyc" -delete 2>/dev/null || true

# Common
rm -rf .ruff_cache
rm -rf .pytest_cache
rm -rf .mypy_cache 2>/dev/null || true

echo "✓ talos-contracts cleaned"
