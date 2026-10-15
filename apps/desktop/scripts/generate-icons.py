#!/usr/bin/env python3
"""
itsLARP Desktop App Icon Generator.
Generates Apple ICNS, Windows ICO, and standard PNG icons from official brand assets.
"""

import os
import shutil
import subprocess
import sys
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DESKTOP_DIR = os.path.dirname(SCRIPT_DIR)
ROOT_DIR = os.path.dirname(os.path.dirname(DESKTOP_DIR))

SOURCE_PNG = os.path.join(ROOT_DIR, "apps", "web", "public", "branding", "icon-512.png")
BUILD_DIR = os.path.join(DESKTOP_DIR, "build")
SRC_DIR = os.path.join(DESKTOP_DIR, "src")
ICONSET_DIR = os.path.join(BUILD_DIR, "icon.iconset")


def main():
    if not os.path.exists(SOURCE_PNG):
        print(f"[ERROR] Source brand icon not found at: {SOURCE_PNG}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(BUILD_DIR, exist_ok=True)
    os.makedirs(ICONSET_DIR, exist_ok=True)

    print(f"[itsLARP] Loading source icon: {SOURCE_PNG}")
    img = Image.open(SOURCE_PNG).convert("RGBA")

    # 1. Generate PNG copies
    target_png = os.path.join(BUILD_DIR, "icon.png")
    runtime_png = os.path.join(SRC_DIR, "icon.png")
    img.save(target_png, format="PNG")
    shutil.copyfile(target_png, runtime_png)
    print(f"[itsLARP] Exported {target_png} and {runtime_png}")

    # 2. Generate Apple Iconset for iconutil
    iconset_specs = [
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    ]

    for filename, dimension in iconset_specs:
        out_path = os.path.join(ICONSET_DIR, filename)
        resized = img.resize((dimension, dimension), Image.Resampling.LANCZOS)
        resized.save(out_path, format="PNG")

    # 3. Convert iconset to .icns via macOS iconutil
    icns_path = os.path.join(BUILD_DIR, "icon.icns")
    if sys.platform == "darwin" and shutil.which("iconutil"):
        print("[itsLARP] Compiling Apple ICNS bundle via iconutil...")
        res = subprocess.run(
            ["iconutil", "-c", "icns", ICONSET_DIR, "-o", icns_path],
            capture_output=True,
            text=True,
        )
        if res.returncode != 0:
            print(f"[WARN] iconutil failed: {res.stderr}. Falling back to Pillow ICNS export.")
            img.save(icns_path, format="ICNS")
        else:
            print(f"[itsLARP] Successfully generated Apple ICNS: {icns_path}")
    else:
        print("[itsLARP] Exporting ICNS using Pillow fallback...")
        img.save(icns_path, format="ICNS")

    # Clean up intermediate iconset directory
    if os.path.exists(ICONSET_DIR):
        shutil.rmtree(ICONSET_DIR)

    # 4. Generate Windows multi-resolution .ico
    ico_path = os.path.join(BUILD_DIR, "icon.ico")
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"[itsLARP] Successfully generated Windows ICO: {ico_path}")

    print("[itsLARP] Desktop brand icon suite successfully generated.")


if __name__ == "__main__":
    main()
