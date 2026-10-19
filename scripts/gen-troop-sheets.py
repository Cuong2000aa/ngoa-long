# -*- coding: utf-8 -*-
"""Thin wrapper — full pipeline: scripts/build-all-wiki-troop-assets.py"""
from __future__ import annotations
import runpy, sys
from pathlib import Path
if __name__ == "__main__":
    target = Path(__file__).resolve().parent / "build-all-wiki-troop-assets.py"
    sys.argv = [str(target)]
    runpy.run_path(str(target), run_name="__main__")
