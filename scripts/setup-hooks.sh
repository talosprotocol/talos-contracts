#!/usr/bin/env bash
set -e

# Link the pre-commit script to git hooks via core.hooksPath
# This requires a .githooks directory

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🛠️  Setting up git hooks for talos-contracts..."

cd "$REPO_ROOT"
mkdir -p .githooks

# Create the .githooks/pre-commit wrapper
cat > .githooks/pre-commit <<EOF
#!/bin/sh
# Delegate to the version-controlled script
bash scripts/pre-commit
EOF

chmod +x .githooks/pre-commit
chmod +x scripts/pre-commit

# Configure git to use .githooks
git config core.hooksPath .githooks

echo "✅ Hooks installed! (core.hooksPath set to .githooks)"
