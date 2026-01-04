#!/usr/bin/env python3
import os
import sys
import argparse
from pathlib import Path

REQUIRED_FILES = [
    "Makefile",
    ".gitignore",
    ".agent",
    "docs",
]

REQUIRED_MAKE_TARGETS = [
    "build",
    "test",
    "conformance",
    "clean",
    "doctor",
    "start",
    "stop",
]

REQUIRED_SCRIPTS = [
    "start.sh",
    "stop.sh",
    "cleanup.sh",
]

def check_repo(repo_path):
    repo = Path(repo_path).resolve()
    if not repo.exists():
        print(f"Error: Repository path {repo} does not exist.")
        return False

    print(f"Linting {repo.name}...")
    errors = []

    # 1. Check Root Files
    for filename in REQUIRED_FILES:
        if not (repo / filename).exists():
            errors.append(f"Missing required file/directory: {filename}")

    # 2. Check Makefile Targets
    makefile = repo / "Makefile"
    if makefile.exists():
        content = makefile.read_text()
        for target in REQUIRED_MAKE_TARGETS:
            # Simple check: target followed by colon
            if f"{target}:" not in content and f"\n{target}:" not in content and not content.startswith(f"{target}:"):
                 errors.append(f"Makefile missing target: {target}")
    
    # 3. Check Scripts
    scripts_dir = repo / "scripts"
    if not scripts_dir.exists():
        errors.append("Missing scripts directory")
    else:
        for script in REQUIRED_SCRIPTS:
            script_path = scripts_dir / script
            if not script_path.exists():
                errors.append(f"Missing script: scripts/{script}")
            else:
                # Check executable (warn only on Windows/fs weirdness, but here we assume unix)
                if not os.access(script_path, os.X_OK):
                     errors.append(f"Script not executable: scripts/{script}")
                
                # Check safety flags
                content = script_path.read_text()
                if "set -euo pipefail" not in content:
                    errors.append(f"Script scripts/{script} missing 'set -euo pipefail'")

    if errors:
        for e in errors:
            print(f"  [FAIL] {e}")
        return False
    else:
        print("  [PASS] All checks passed.")
        return True

def main():
    parser = argparse.ArgumentParser(description="Talos Repository Linter")
    parser.add_argument("repos", nargs="+", help="Paths to repositories to check")
    args = parser.parse_args()

    failed = False
    for repo in args.repos:
        if not check_repo(repo):
            failed = True
            print("")
    
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
