#!/usr/bin/env python3
import sys
from pathlib import Path

EXTENSIONS = {".ts", ".tsx", ".py", ".js", ".jsx"}
IGNORE_DIRS = {".git", ".next", "node_modules", ".venv", "dist", "build", "__pycache__"}
MAX_LINES = 500

def check_file_line_limits(root_dir: Path) -> int:
    violators = []
    for path in root_dir.rglob("*"):
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if path.suffix in EXTENSIONS and path.is_file():
            try:
                line_count = len(path.read_text(encoding="utf-8", errors="ignore").splitlines())
                if line_count > MAX_LINES:
                    violators.append((str(path), line_count))
            except Exception as e:
                print(f"Error reading {path}: {e}", file=sys.stderr)

    if violators:
        print(f"FAILED: {len(violators)} source files exceed the {MAX_LINES}-line limit:")
        for file_path, count in violators:
            print(f"  {file_path}: {count} lines")
        return 1

    print(f"SUCCESS: All source files conform to the <={MAX_LINES} lines policy.")
    return 0

if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    sys.exit(check_file_line_limits(project_root))
