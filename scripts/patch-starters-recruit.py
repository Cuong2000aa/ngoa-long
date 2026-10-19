# -*- coding: utf-8 -*-
"""Raise prestige gates for legend recruits (no longer starters)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "data" / "recruit.json"
data = json.loads(path.read_text(encoding="utf-8"))

PATCH = {
    "liubei": {
        "source": "prestige",
        "required_prestige": 3500,
        "required_player_level": 14,
        "required_ty_vu_level": 10,
        "required_stage": "ch2_s6",
        "note": "Ngọa Long gốc: minh chủ mở muộn theo uy danh.",
    },
    "guanyu": {
        "source": "prestige",
        "required_prestige": 5000,
        "required_player_level": 16,
        "required_ty_vu_level": 12,
        "required_stage": "ch3_s4",
        "note": "Danh tướng đỏ — không mở đầu.",
    },
    "zhangfei": {
        "source": "prestige",
        "required_prestige": 3500,
        "required_player_level": 14,
        "required_ty_vu_level": 10,
        "required_stage": "ch2_s6",
    },
    "caocao": {
        "source": "prestige",
        "required_prestige": 5000,
        "required_player_level": 16,
        "required_ty_vu_level": 12,
        "required_stage": "ch3_s4",
    },
    "xuchu": {
        "source": "prestige",
        "required_prestige": 2000,
        "required_player_level": 12,
        "required_ty_vu_level": 8,
        "required_stage": "ch2_s3",
    },
    "dianwei": {
        "source": "prestige",
        "required_prestige": 2000,
        "required_player_level": 12,
        "required_ty_vu_level": 8,
        "required_stage": "ch2_s3",
    },
    "sunquan": {
        "source": "prestige",
        "required_prestige": 3500,
        "required_player_level": 14,
        "required_ty_vu_level": 10,
        "required_stage": "ch2_s6",
    },
    "zhouyu": {
        "source": "prestige",
        "required_prestige": 5000,
        "required_player_level": 16,
        "required_ty_vu_level": 12,
        "required_stage": "ch3_s4",
    },
    "huanggai": {
        "source": "campaign_defeat",
        "required_prestige": 500,
        "required_player_level": 8,
        "required_ty_vu_level": 5,
        "required_stage": "ch1_s6",
    },
}

for item in data.get("list", []):
    hid = item.get("hero_id")
    if hid in PATCH:
        item.update(PATCH[hid])

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("patched", len(PATCH), "legend recruits")
