#!/bin/bash
set -e

# Build Python Assets
# Copies schemas and vectors into the python package directory for bundling.

REPO_ROOT=$(pwd)
PYTHON_PKG_DIR="$REPO_ROOT/python/talos_contracts"
ASSETS_DIR="$PYTHON_PKG_DIR/assets"

echo "Bundling schemas into Python package..."

# Clean old assets
if [ -d "$ASSETS_DIR" ]; then
    rm -rf "$ASSETS_DIR"
fi
mkdir -p "$ASSETS_DIR"

# Copy Schemas
# We want: assets/schemas/rbac/...
# Source: schemas/rbac/...
if [ -d "$REPO_ROOT/schemas" ]; then
    cp -r "$REPO_ROOT/schemas" "$ASSETS_DIR/schemas"
    echo "Copied schemas."
else
    echo "ERROR: schemas directory not found at $REPO_ROOT/schemas"
    exit 1
fi

# Copy Test Vectors (Optional but good for SDK tests)
# Source: test_vectors/sdk/...
if [ -d "$REPO_ROOT/test_vectors" ]; then
    cp -r "$REPO_ROOT/test_vectors" "$ASSETS_DIR/vectors"
    echo "Copied vectors."
fi

# Add __init__.py to assets to make it a package (optional, but good practice if accessing resources)
touch "$ASSETS_DIR/__init__.py"

echo "Python assets bundled successfully."
