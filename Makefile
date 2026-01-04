# talos-contracts Makefile
# Source of Truth for Talos Protocol

.PHONY: install build test lint clean start stop

# Default target
all: install build test

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd typescript && npm ci
	cd python && pip install -e . -q

# Build artifacts
build:
	@echo "Building..."
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
	@echo "Validating conformance vectors..."
	cd typescript && npm test -- --run

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
