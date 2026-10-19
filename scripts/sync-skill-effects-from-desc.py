#!/usr/bin/env python3
"""
Đọc mô tả kỹ năng (tag [Hiệu Ứng] wiki) → ghi/merge `effects[]` vào skills.json.

Sau xuất chiêu: engine apply buff/debuff → icon trên đầu giữ đến hết hiệu ứng.
Chạy: python3 scripts/sync-skill-effects-from-desc.py
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS_PATH = ROOT / "data" / "skills.json"

SKIP_BRACKETS = {
    "thường",
    "chiến",
    "thần",
    "truyền thuyết",
    "thần hoàng",
    "c.pháp",
    "kế sách",
    "hỗ trợ",
    "bị động",
    "vật lý",
    "chiến+kế",
}

# Tên wiki (lower) → effect engine. label = chữ hiện trên đầu / float.
NAME_MAP: dict[str, dict] = {
    "thiết bích": {"type": "def_up", "value": 0.35, "duration": 1, "target": "self", "label": "Thiết Bích"},
    "kiên thủ": {"type": "def_up", "value": 0.2, "duration": 2, "target": "self", "label": "Kiên Thủ"},
    "kiên thủ 2": {"type": "def_up", "value": 0.25, "duration": 2, "target": "self", "label": "Kiên Thủ"},
    "thủ hộ": {"type": "def_up", "value": 0.15, "duration": 2, "target": "ally", "label": "Thủ Hộ"},
    "thủ hộ 2": {"type": "def_up", "value": 0.2, "duration": 2, "target": "ally", "label": "Thủ Hộ"},
    "đề kháng": {"type": "def_up", "value": 0.15, "duration": 2, "target": "ally", "label": "Đề Kháng"},
    "hộ thuẫn": {"type": "def_up", "value": 0.2, "duration": 1, "target": "self", "label": "Hộ Thuẫn"},
    "tử thủ": {"type": "def_up", "value": 0.25, "duration": 2, "target": "self", "label": "Tử Thủ"},
    "anh dũng": {"type": "atk_up", "value": 0.12, "duration": 2, "target": "ally", "label": "Anh Dũng"},
    "anh dũng 2": {"type": "atk_up", "value": 0.15, "duration": 2, "target": "ally", "label": "Anh Dũng"},
    "hỗn loạn": {"type": "stun", "chance": 0.55, "duration": 1, "label": "Hỗn Loạn"},
    "ám tế": {"type": "silence", "chance": 0.7, "duration": 2, "label": "Ám Tế"},
    "khóa vây": {"type": "stun", "chance": 1.0, "duration": 1, "label": "Khóa Vây"},
    "trúng độc": {"type": "poison", "duration": 2, "label": "Trúng Độc"},
    "kịch độc": {"type": "poison", "duration": 2, "label": "Kịch Độc"},
    "thi độc": {"type": "poison", "duration": 2, "label": "Thi Độc"},
    "thiêu đốt": {"type": "burn", "duration": 2, "label": "Thiêu Đốt"},
    "thiên hỏa": {"type": "burn", "duration": 2, "label": "Thiên Hỏa"},
    "giảm tấn công": {"type": "atk_down", "value": 0.12, "duration": 2, "label": "Giảm Công"},
    "giảm công 2": {"type": "atk_down", "value": 0.15, "duration": 2, "label": "Giảm Công"},
    "hạ thấp phòng thủ": {"type": "def_down", "value": 0.12, "duration": 2, "label": "Phá Thủ"},
    "giảm phòng thủ": {"type": "def_down", "value": 0.12, "duration": 2, "label": "Phá Thủ"},
    "giảm phòng": {"type": "def_down", "value": 0.12, "duration": 2, "label": "Phá Thủ"},
    "hồi phục": {"type": "heal_pct", "value": 0.12, "target": "ally", "label": "Hồi Phục"},
    "hội tâm": {"type": "wiki_buff", "id": "hoi_tam", "kind": "buff", "duration": 2, "label": "Hội Tâm"},
    "hội tâm 2": {"type": "wiki_buff", "id": "hoi_tam", "kind": "buff", "duration": 2, "label": "Hội Tâm"},
    "âm hồn": {"type": "wiki_buff", "id": "am_hon", "kind": "buff", "duration": 2, "label": "Âm Hồn"},
    "nguyệt hồn": {"type": "wiki_buff", "id": "nguyet_hon", "kind": "buff", "duration": 2, "label": "Nguyệt Hồn"},
    "hấp huyết": {"type": "wiki_buff", "id": "hap_huyet", "kind": "buff", "duration": 2, "label": "Hấp Huyết"},
    "nghĩa tuyệt": {"type": "wiki_buff", "id": "nghia_tuyet", "kind": "buff", "duration": 99, "label": "Nghĩa Tuyệt"},
    "tòng long": {"type": "wiki_buff", "id": "tong_long", "kind": "buff", "duration": 2, "label": "Tòng Long"},
    "thần binh": {"type": "wiki_buff", "id": "than_binh", "kind": "buff", "duration": 2, "label": "Thần Binh"},
    "miễn dịch": {"type": "wiki_buff", "id": "mien_dich", "kind": "buff", "duration": 1, "label": "Miễn Dịch"},
    "tịnh hóa": {"type": "wiki_buff", "id": "tinh_hoa", "kind": "buff", "duration": 1, "label": "Tịnh Hóa"},
    "thiên vận": {"type": "wiki_buff", "id": "thien_van", "kind": "buff", "duration": 2, "label": "Thiên Vận"},
    "treo thưởng": {"type": "wiki_debuff", "id": "treo_thuong", "kind": "debuff", "duration": 2, "label": "Treo Thưởng"},
    "đào binh": {"type": "wiki_debuff", "id": "dao_binh", "kind": "debuff", "duration": 2, "label": "Đào Binh"},
    "sợ hãi": {"type": "wiki_debuff", "id": "so_hai", "kind": "debuff", "duration": 2, "label": "Sợ Hãi"},
    "áp ức": {"type": "wiki_debuff", "id": "ap_uc", "kind": "debuff", "duration": 2, "label": "Áp Ức"},
    "mê hoặc": {"type": "wiki_debuff", "id": "me_hoac", "kind": "control", "duration": 1, "label": "Mê Hoặc"},
    "tê liệt": {"type": "wiki_debuff", "id": "te_liet", "kind": "control", "duration": 1, "label": "Tê Liệt"},
    "đóng băng": {"type": "wiki_debuff", "id": "dong_bang", "kind": "control", "duration": 1, "label": "Đóng Băng"},
    "tỏa binh": {"type": "wiki_debuff", "id": "toa_binh", "kind": "debuff", "duration": 2, "label": "Tỏa Binh"},
    "điên cuồng": {"type": "wiki_buff", "id": "dien_cuong", "kind": "buff", "duration": 2, "label": "Điên Cuồng"},
    "huyết cúc": {"type": "wiki_debuff", "id": "huyet_cuc", "kind": "debuff", "duration": 2, "label": "Huyết Cúc"},
    "thấu suốt": {"type": "wiki_buff", "id": "thau_suot", "kind": "buff", "duration": 2, "label": "Thấu Suốt"},
    "phản kích": {"type": "wiki_buff", "id": "phan_kich", "kind": "buff", "duration": 2, "label": "Phản Kích"},
    "loại bỏ": {"type": "wiki_debuff", "id": "loai_bo", "kind": "debuff", "duration": 1, "label": "Loại Bỏ"},
    "phá thánh": {"type": "wiki_debuff", "id": "pha_thanh", "kind": "debuff", "duration": 2, "label": "Phá Thánh"},
    "độ hiểm": {"type": "wiki_debuff", "id": "do_hiem", "kind": "debuff", "duration": 2, "label": "Độ Hiểm"},
    "bát quái": {"type": "wiki_buff", "id": "bat_quai", "kind": "buff", "duration": 2, "label": "Bát Quái"},
    "đồn điền": {"type": "wiki_buff", "id": "don_dien", "kind": "buff", "duration": 2, "label": "Đồn Điền"},
    "tan vỡ": {"type": "wiki_debuff", "id": "tan_vo", "kind": "debuff", "duration": 1, "label": "Tan Vỡ"},
    "thị huyết": {"type": "wiki_buff", "id": "thi_huyet", "kind": "buff", "duration": 2, "label": "Thị Huyết"},
    "hỏa thần": {"type": "wiki_buff", "id": "hoa_than", "kind": "buff", "duration": 2, "label": "Hỏa Thần"},
    "hoạt lực": {"type": "wiki_buff", "id": "hoat_luc", "kind": "buff", "duration": 2, "label": "Hoạt Lực"},
    "dũng tuyệt": {"type": "atk_up", "value": 0.15, "duration": 3, "target": "self", "label": "Dũng Tuyệt"},
    "bạo nộ": {"type": "atk_up", "value": 0.12, "duration": 2, "target": "self", "label": "Bạo Nộ"},
    "hồi xuân": {"type": "heal_pct", "value": 0.15, "target": "ally", "label": "Hồi Xuân"},
    "do dự": {"type": "atk_down", "value": 0.1, "duration": 2, "label": "Do Dự"},
    "kích nộ": {"type": "wiki_buff", "id": "kich_no", "kind": "buff", "duration": 2, "label": "Kích Nộ"},
    "thần tốc": {"type": "wiki_buff", "id": "than_toc", "kind": "buff", "duration": 2, "label": "Thần Tốc"},
    "bạch nhẫn": {"type": "wiki_buff", "id": "bach_nhan", "kind": "buff", "duration": 2, "label": "Bạch Nhẫn"},
    "kiêu binh": {"type": "wiki_buff", "id": "kieu_binh", "kind": "buff", "duration": 2, "label": "Kiêu Binh"},
    "tru thần": {"type": "wiki_debuff", "id": "tru_than", "kind": "debuff", "duration": 2, "label": "Tru Thần"},
    "khống chế": {"type": "stun", "chance": 0.4, "duration": 1, "label": "Khống Chế"},
    "ngủ say": {"type": "stun", "chance": 0.6, "duration": 1, "label": "Ngủ Say"},
    "liên kích": {"type": "wiki_buff", "id": "lien_kich", "kind": "buff", "duration": 2, "label": "Liên Kích"},
}


def brackets(desc: str) -> list[str]:
    return re.findall(r"\[([^\]]+)\]", desc or "")


def parse_duration(desc: str, name: str, default: int) -> int:
    pat = re.compile(
        rf"\[{re.escape(name)}\][^\[\]]{{0,80}}?duy trì\s*(\d+)\s*lượt",
        re.IGNORECASE,
    )
    m = pat.search(desc or "")
    if m:
        return max(1, int(m.group(1)))
    m2 = re.search(r"duy trì\s*(\d+)\s*lượt", desc or "", re.IGNORECASE)
    if m2:
        return max(1, int(m2.group(1)))
    return default


def infer_target(desc: str, name: str, default: str | None) -> str | None:
    """Chỉ đọc cụm TRƯỚC tag — tránh [Thiết Bích]… toàn phe ta nhận [Thủ Hộ] làm lệch target."""
    d = (desc or "").lower()
    idx = d.find(f"[{name.lower()}]")
    before = d[max(0, idx - 48) : idx] if idx >= 0 else d
    if "bản thân nhận" in before or "bản thân vào" in before or "bản thân " in before[-12:]:
        return "self"
    if "toàn phe ta" in before or "phe ta nhận" in before or "đồng đội" in before:
        return "ally"
    return default


def effects_from_desc(desc: str) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for raw in brackets(desc):
        key = raw.strip().lower()
        if key in SKIP_BRACKETS:
            continue
        spec = NAME_MAP.get(key)
        if not spec:
            continue
        e = dict(spec)
        if "duration" in e:
            e["duration"] = parse_duration(desc, raw, int(e["duration"]))
        tgt = infer_target(desc, raw, e.get("target"))
        if tgt:
            e["target"] = tgt
        dk = f"{e.get('type')}:{e.get('id') or ''}:{e.get('label') or ''}"
        if dk in seen:
            continue
        seen.add(dk)
        out.append(e)
    if not out:
        d = (desc or "").lower()
        for kw in ("thiết bích", "hỗn loạn", "ám tế", "trúng độc", "thiêu đốt", "anh dũng", "kiên thủ"):
            if kw in d and kw in NAME_MAP:
                e = dict(NAME_MAP[kw])
                dk = f"{e.get('type')}:{e.get('label')}"
                if dk not in seen:
                    seen.add(dk)
                    out.append(e)
    return out


def merge_effects(old: list | None, new: list[dict]) -> list[dict]:
    """Ưu tiên effect từ desc (có label wiki). Bỏ bản trùng type không label."""
    merged: list[dict] = []
    seen: set[str] = set()
    labeled_types: set[str] = set()
    for e in list(new or []) + list(old or []):
        if not isinstance(e, dict) or not e.get("type"):
            continue
        t = e["type"]
        if e.get("label"):
            labeled_types.add(t)
    for e in list(new or []) + list(old or []):
        if not isinstance(e, dict) or not e.get("type"):
            continue
        t = e["type"]
        # Đã có def_up «Thiết Bích» → bỏ def_up trơn từ bản cũ
        if not e.get("label") and t in labeled_types and t in (
            "def_up",
            "atk_up",
            "poison",
            "burn",
            "stun",
            "silence",
            "atk_down",
            "def_down",
        ):
            continue
        dk = f"{t}:{e.get('id') or ''}:{e.get('label') or t}"
        if dk in seen:
            continue
        seen.add(dk)
        merged.append(e)
    return merged


def main() -> None:
    data = json.loads(SKILLS_PATH.read_text(encoding="utf-8"))
    skills = data["skills"]
    added = updated = 0
    uncovered: Counter[str] = Counter()

    for sk in skills.values():
        desc = sk.get("desc") or ""
        inferred = effects_from_desc(desc)
        for raw in brackets(desc):
            key = raw.strip().lower()
            if key not in SKIP_BRACKETS and key not in NAME_MAP:
                uncovered[raw] += 1
        if not inferred:
            continue
        old = sk.get("effects")
        merged = merge_effects(old if isinstance(old, list) else None, inferred)
        if not old:
            sk["effects"] = merged
            added += 1
        elif json.dumps(merged, ensure_ascii=False, sort_keys=True) != json.dumps(
            old, ensure_ascii=False, sort_keys=True
        ):
            sk["effects"] = merged
            updated += 1

    SKILLS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"skills with new effects: {added}")
    print(f"skills effects refreshed: {updated}")
    print("top unmapped [brackets] (bổ sung NAME_MAP nếu cần):")
    for name, n in uncovered.most_common(20):
        print(f"  {n:4d}  [{name}]")


if __name__ == "__main__":
    main()
