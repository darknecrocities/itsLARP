#!/usr/bin/env python3
"""
Integrity check enforcing the strict 500-line physical limit on all source files
across the entire codebase.
"""
import os
import sys

EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    ".next",
    ".venv",
    "venv",
    "dist",
    "release",
    "out",
    "__pycache__",
    "build",
    ".turbo",
}

SOURCE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py", ".css", ".json"}
# Files like package-lock.json or release checksums/metadata are machine-generated
EXCLUDE_FILES = {"package-lock.json", "SHA256SUMS.txt"}

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    violations = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

        for fname in filenames:
            if fname in EXCLUDE_FILES:
                continue
            ext = os.path.splitext(fname)[1]
            if ext in SOURCE_EXTENSIONS:
                filepath = os.path.join(dirpath, fname)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        count = sum(1 for _ in f)
                        if count > 500:
                            rel_path = os.path.relpath(filepath, root_dir)
                            violations.append((count, rel_path))
                except Exception as e:
                    print(f"Warning: could not read {filepath}: {e}", file=sys.stderr)

    if violations:
        print("[FAIL] The following files exceed the 500-line physical limit:", file=sys.stderr)
        for count, p in sorted(violations, reverse=True):
            print(f"  {p}: {count} lines (limit: 500)", file=sys.stderr)
        sys.exit(1)
    else:
        print("[PASS] All source files adhere to the strict 500-line physical limit.")
        sys.exit(0)

if __name__ == "__main__":
    main()
