#!/usr/bin/env python3
"""Phân cấp 590 chiêu → loại / hệ màu / kiểu FX (cho VFX pipeline).

Out:
  data/skill-fx-classify.csv
  data/skill-fx-classify.json
  docs/wiki/SKILL-FX-CLASSIFY.md
"""
from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "data" / "skills.json"
OUT_CSV = ROOT / "data" / "skill-fx-classify.csv"
OUT_JSON = ROOT / "data" / "skill-fx-classify.json"
OUT_MD = ROOT / "docs" / "wiki" / "SKILL-FX-CLASSIFY.md"

HOSTILE = {"single", "all", "column", "row", "front_row"}
ALLY = {"ally_all", "self"}

# flash/motif → hệ màu (hiển thị)
COLOR_MAP = {
    "dragon": "Hỏa · đỏ-cam",
    "fire_rain": "Hỏa · đỏ-cam",
    "fire": "Hỏa · đỏ-cam",
    "orange": "Hỏa · đỏ-cam",
    "red_fire": "Hỏa · đỏ-cam",
    "green_poison": "Độc · lục",
    "poison": "Độc · lục",
    "snake": "Độc · lục",
    "fire_green": "Độc · lục",
    "blue_water": "Thủy · lam",
    "cyan": "Thủy · lam",
    "teal": "Thủy · lam",
    "white_blue": "Thủy · lam",
    "water": "Thủy · lam",
    "thunder": "Lôi · vàng tím",
    "storm": "Lôi · vàng tím",
    "purple": "Huyền · tím",
    "violet": "Huyền · tím",
    "bagua": "Huyền · tím",
    "crimson": "Huyết · son",
    "dark_red": "Huyết · son",
    "gold_red": "Huyết · son",
    "red": "Huyết · son",
    "shadow": "Huyết · son",
    "gold_soft": "Kim khí · vàng",
    "gold": "Kim khí · vàng",
    "yellow": "Kim khí · vàng",
    "buff": "Kim khí · vàng",
    "heal": "Kim khí · vàng",
    "shield": "Khiên · vàng",
    "steel": "Kim/Thép · bạc",
    "iron": "Kim/Thép · bạc",
    "white": "Kim/Thép · bạc",
    "slash": "Kim/Thép · bạc",
    "pierce": "Kim/Thép · bạc",
    "brown": "Thổ · nâu",
    "charge": "Thổ · nâu",
    "whirlwind": "Phong · cyan",
    "wind": "Phong · cyan",
    "tiger": "Hổ · vàng hổ",
    "wolf": "Sói · bạc xám",
    "rush": "Xung · thép",
    "blue": "Mưu · lam",
    "arcane": "Mưu · lam",
}

# → kiểu hiệu ứng VFX (cột 4)
VFX_MAP = {
    "dragon": "hồn_rồng",
    "tiger": "hồn_hổ",
    "wolf": "hồn_sói",
    "poison": "hồn_xà",
    "snake": "hồn_xà",
    "water": "hồn_thủy",
    "thunder": "hồn_lôi",
    "whirlwind": "hồn_phong",
    "wind": "hồn_phong",
    "fire": "hỏa",
    "fire_rain": "hỏa",
    "slash": "người_chém",
    "pierce": "người_đâm",
    "rush": "xung_kích",
    "charge": "kỵ_xung",
    "shield": "khiên",
    "heal": "aura_buff",
    "buff": "aura_buff",
    "shadow": "bóng_ám",
    "bagua": "bát_quái",
    "arcane": "mưu",
}


def effect_sets(skill: dict) -> tuple[set[str], set[str]]:
    types: set[str] = set()
    labels: set[str] = set()
    for e in skill.get("effects") or []:
        if e.get("type"):
            types.add(str(e["type"]))
        if e.get("label"):
            labels.add(str(e["label"]))
    return types, labels


def classify_loai(skill: dict) -> str:
    """Cột 2: sát thương / buff / debuff / giáp / độc / … (có thể ghép +)."""
    types, labels = effect_sets(skill)
    power = float(skill.get("power") or 0)
    pattern = str(skill.get("pattern") or "")
    fx = skill.get("fx") or {}
    motif = str(fx.get("motif") or "").lower()
    flash = str(fx.get("flash") or "").lower()
    roles: list[str] = []

    if (
        motif == "shield"
        or flash == "shield"
        or labels & {"Thiết Bích", "Hộ Thuẫn", "Kiên Thủ", "Thủ Hộ", "Đề Kháng"}
        or "def_up" in types
    ):
        roles.append("giáp")
    if "poison" in types or motif == "poison" or flash in ("green_poison", "snake", "poison") or "Trúng Độc" in labels:
        roles.append("độc")
    if "burn" in types or labels & {"Thiêu Đốt", "Thiên Hỏa"}:
        roles.append("thiêu")
    if "heal_pct" in types or motif == "heal" or "Trị Liệu" in labels:
        roles.append("trị liệu")
    if "stun" in types or labels & {"Hỗn Loạn", "Tê Liệt", "Sợ Hãi"}:
        roles.append("khống chế")
    if "silence" in types or "Tỏa Binh" in labels:
        roles.append("câm lặng")
    if any(t in types for t in ("wiki_debuff", "atk_down", "def_down")) or labels & {
        "Áp Ức",
        "Đào Binh",
        "Ám Tế",
        "Loại Bỏ",
    }:
        roles.append("debuff")
    if (
        any(t in types for t in ("wiki_buff", "atk_up", "morale_boost"))
        or motif == "buff"
        or labels & {"Sĩ Khí", "Anh Dũng", "Hội Tâm", "Thiên Vận", "Thần Binh"}
    ):
        # buff thật sự (hỗ trợ) hoặc tự buff kèm đánh
        roles.append("buff")
    if power > 0 and pattern in HOSTILE:
        roles.append("sát thương")
    elif power > 0 and pattern not in ALLY and "sát thương" not in roles:
        roles.append("sát thương")

    if not roles:
        if pattern in ALLY or motif in ("heal", "buff", "shield"):
            roles.append("buff")
        else:
            roles.append("sát thương")

    # thứ tự ưu tiên hiển thị
    order = ["sát thương", "buff", "debuff", "giáp", "độc", "thiêu", "trị liệu", "khống chế", "câm lặng"]
    roles = [r for r in order if r in roles]
    return "+".join(roles)


def classify_mau(skill: dict) -> str:
    fx = skill.get("fx") or {}
    motif = str(fx.get("motif") or "").lower()
    flash = str(fx.get("flash") or "").lower()
    # motif dedicated thắng flash generic
    for key in (motif, flash):
        if key in COLOR_MAP and key not in ("slash", "pierce", "arcane", "blue"):
            if key == motif or flash in COLOR_MAP:
                pass
    if motif in COLOR_MAP and motif not in ("slash", "pierce", "arcane"):
        return COLOR_MAP[motif]
    if flash in COLOR_MAP:
        return COLOR_MAP[flash]
    if motif in COLOR_MAP:
        return COLOR_MAP[motif]
    return "Mưu · lam" if skill.get("damageType") == "strategy" else "Kim/Thép · bạc"


def classify_vfx(skill: dict) -> str:
    fx = skill.get("fx") or {}
    motif = str(fx.get("motif") or "").lower()
    flash = str(fx.get("flash") or "").lower()
    style = str(fx.get("style") or "").lower()
    pattern = str(skill.get("pattern") or "")
    name = str(skill.get("name") or "")
    sid = str(skill.get("id") or "")
    blob = f"{name} {sid} {motif} {flash}".lower()

    # Hồn thú / element dedicated
    if motif in VFX_MAP:
        base = VFX_MAP[motif]
    elif flash in VFX_MAP:
        base = VFX_MAP[flash]
    elif "xà" in blob or "rắn" in blob:
        base = "hồn_xà"
    elif "long" in blob or "rồng" in blob:
        base = "hồn_rồng"
    elif "hổ" in blob:
        base = "hồn_hổ"
    elif "sói" in blob:
        base = "hồn_sói"
    elif flash == "blue" or motif == "arcane":
        base = "mưu"
    else:
        base = "người_chém"

    # hình thức cast
    shape = ""
    if style == "barrier" or motif == "shield":
        shape = "khiên"
        base = "khiên"
    elif style in ("ally_bless", "ally_aura") or motif in ("heal", "buff"):
        shape = "aura"
        if base not in ("aura_buff", "khiên"):
            base = "aura_buff"
    elif style == "cavalry_charge" or motif == "charge":
        base = "kỵ_xung"
    elif style == "rush_assault" or motif == "rush":
        base = "xung_kích"
    elif style == "aoe_nova" or pattern == "all":
        shape = "aoe"
    elif style == "column_pierce" or pattern == "column":
        shape = "cột"
    elif style == "row_sweep" or pattern in ("row", "front_row"):
        shape = "hàng"
    elif pattern == "single":
        shape = "đơn"

    return f"{base}|{shape}" if shape and shape not in base else base


def main() -> None:
    db = json.loads(SKILLS.read_text(encoding="utf-8"))
    skills = db["skills"]
    rows: list[dict] = []
    for sid, sk in sorted(skills.items(), key=lambda x: x[1].get("name") or x[0]):
        fx = sk.get("fx") or {}
        loai = classify_loai(sk)
        mau = classify_mau(sk)
        vfx = classify_vfx(sk)
        rows.append(
            {
                "id": sid,
                "ten": sk.get("name") or sid,
                "loai": loai,
                "he_mau": mau,
                "kieu_fx": vfx,
                "flash": fx.get("flash") or "",
                "motif": fx.get("motif") or "",
                "style": fx.get("style") or "",
                "pattern": sk.get("pattern") or "",
                "damageType": sk.get("damageType") or "",
                "power": sk.get("power") or 0,
            }
        )

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["ten", "loai", "he_mau", "kieu_fx", "id", "flash", "motif", "style", "pattern", "damageType", "power"],
        )
        w.writeheader()
        for r in rows:
            w.writerow(r)

    OUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    c_loai = Counter(r["loai"] for r in rows)
    c_mau = Counter(r["he_mau"] for r in rows)
    c_vfx = Counter(r["kieu_fx"] for r in rows)

    lines = [
        "# Phân cấp chiêu → VFX (590)",
        "",
        "Sinh bởi `python3 scripts/classify-skill-fx.py`.",
        "",
        "| Cột | Ý nghĩa |",
        "|-----|---------|",
        "| **Tên** | Tên chiêu |",
        "| **Loại** | sát thương / buff / debuff / giáp / độc / thiêu / trị liệu / khống chế… (ghép `+`) |",
        "| **Hệ màu** | Palette flash |",
        "| **Kiểu FX** | hồn thú / độc / hỏa / người / lôi / khiên / aura… (+ hình thức aoe/cột/…) |",
        "",
        f"File đầy đủ: [`data/skill-fx-classify.csv`](../../data/skill-fx-classify.csv) · JSON [`data/skill-fx-classify.json`](../../data/skill-fx-classify.json)",
        "",
        "## Thống kê loại",
        "",
        "| Loại | Số |",
        "|------|---:|",
    ]
    for k, n in c_loai.most_common():
        lines.append(f"| {k} | {n} |")
    lines += ["", "## Thống kê hệ màu", "", "| Hệ màu | Số |", "|--------|---:|"]
    for k, n in c_mau.most_common():
        lines.append(f"| {k} | {n} |")
    lines += ["", "## Thống kê kiểu FX", "", "| Kiểu FX | Số |", "|---------|---:|"]
    for k, n in c_vfx.most_common():
        lines.append(f"| `{k}` | {n} |")
    lines += [
        "",
        "## Mẫu (30 chiêu đầu theo tên)",
        "",
        "| Tên | Loại | Hệ màu | Kiểu FX |",
        "|-----|------|--------|---------|",
    ]
    for r in rows[:30]:
        lines.append(f"| {r['ten']} | {r['loai']} | {r['he_mau']} | `{r['kieu_fx']}` |")
    lines.append("")
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK {len(rows)} skills → {OUT_CSV.relative_to(ROOT)}")
    print("loai top:", c_loai.most_common(8))
    print("vfx top:", c_vfx.most_common(12))


if __name__ == "__main__":
    main()
