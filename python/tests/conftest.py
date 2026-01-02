"""Pytest configuration - add package to path without requiring install."""

import sys
from pathlib import Path

# Add the parent directory (containing talos_contracts) to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
