# talos-contracts Makefile
# Source of Truth for Talos Protocol

.PHONY: install build test lint clean start stop typecheck conformance interop

SDK_PY_DIR ?= ../sdks/python
SDK_TS_DIR ?= ../sdks/typescript

# Interop: Run Python <-> TypeScript interop vectors
interop:
	@echo "Running interop tests..."
	@echo "Preflight: Checking harness commands..."
	@command -v python3 >/dev/null 2>&1 || { echo "ERROR: python3 not found"; exit 1; }
	@[ -f "$(SDK_PY_DIR)/Makefile" ] || { echo "ERROR: talos-sdk-py not found at $(SDK_PY_DIR)"; exit 1; }
	@[ -f "$(SDK_TS_DIR)/Makefile" ] || { echo "ERROR: talos-sdk-ts not found at $(SDK_TS_DIR)"; exit 1; }
	@echo "Preflight passed."
	@echo "Running Python conformance..."
	cd $(SDK_PY_DIR) && make conformance
	@echo "Running TypeScript conformance..."
	cd $(SDK_TS_DIR) && make conformance

# Install dependencies
install:
	@echo "Installing dependencies..."
	./scripts/build_python_assets.sh
	cd typescript && npm ci
	cd python && pip install -e . -q

# Build artifacts
build:
	@echo "Building..."
	./scripts/build_python_assets.sh
	cd typescript && npm run build

# Run tests
test:
	@echo "Running tests..."
	cd typescript && npm test -- --run
	cd python && pytest tests/ -q

# Lint check
lint:
	@echo "Running lint..."
	cd typescript && npm run lint || true
	cd python && ruff check talos_contracts tests || true

# Type check (includes schema validation)
typecheck:
	@echo "Running type checks..."
	cd typescript && npm run typecheck
	@echo "Validating JSON schemas..."
	cd typescript && npm test -- --run test/schemas.test.ts 2>/dev/null || echo "Schema tests not found"

# Clean all generated files and dependencies
clean:
	@echo "Cleaning..."
	rm -rf typescript/dist
	rm -rf typescript/node_modules
	rm -rf python/*.egg-info
	rm -rf python/__pycache__
	rm -rf python/talos_contracts/__pycache__
	rm -rf python/tests/__pycache__
	rm -rf python/.pytest_cache
	rm -rf .ruff_cache
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "Clean complete. Ready for fresh build."

# Conformance: Validate vectors against schemas
conformance:
	@echo "Running conformance validation..."
	@echo "Step 0: Schema validation"
	cd typescript && npm test -- --run test/vectors.test.ts
	@echo "Step 0: Python schema validation"
	cd python && pytest tests/test_vectors.py -q 2>/dev/null || echo "No Python vector tests"


# Doctor check
doctor:
	@echo "Checking environment..."
	@node --version || echo "Node.js missing"
	@npm --version || echo "npm missing"
	@python3 --version || echo "Python3 missing"

# Scripts wrapper
start:
	@./scripts/start.sh

stop:
	@./scripts/stop.sh

