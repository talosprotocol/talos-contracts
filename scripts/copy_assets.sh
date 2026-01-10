#!/bin/bash
set -e

# Get the absolute path to the repo root (assuming script is in scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Copying assets from $REPO_ROOT..."

# TypeScript
TS_ASSETS_DIR="$REPO_ROOT/typescript/assets"
mkdir -p "$TS_ASSETS_DIR"
cp -r "$REPO_ROOT/schemas" "$TS_ASSETS_DIR/"
cp -r "$REPO_ROOT/test_vectors" "$TS_ASSETS_DIR/"
echo "Copied to TypeScript assets."

# Python
PY_ASSETS_DIR="$REPO_ROOT/python/talos_contracts/assets"
mkdir -p "$PY_ASSETS_DIR"
cp -r "$REPO_ROOT/schemas" "$PY_ASSETS_DIR/"
cp -r "$REPO_ROOT/test_vectors" "$PY_ASSETS_DIR/"
# Create __init__.py to make it a package
touch "$PY_ASSETS_DIR/__init__.py"
echo "Copied to Python assets."

echo "Asset copy complete."
