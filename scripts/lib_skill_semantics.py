#!/usr/bin/env python3
"""
Semantics chiêu Ngọa Long — dùng chung cho sync / repair / test.

Rule:
- Buff/debuff từ [tag] wiki → effects (bám catalog hieu-ung)
- Không đọc «hồi sĩ khí» thành heal máu
- Pattern / hits / motif bám mô tả + FLASH_MAP
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

SKIP_BRACKETS = {
    "thường",
    "chiến",
    "thần",
    "truyền thuyết",
    "thần hoàng",
    "thượng cổ",
    "thái sơ",
    "c.pháp",
    "kế sách",
    "hỗ trợ",
    "bị động",
    "vật lý",
    "chiến+kế",
    "chiến+kế+thường",
    "chiến+thường",
    "kế sách+thường",
    "kế+thường",
    "thường+kế",
    "chiến pháp+kế sách+thường",
    "chiến pháp + kế sách + thường",
    "chiến pháp+kế sách",
}

# Override tay — giá trị combat rõ (ưu tiên hơn auto catalog)
NAME_MAP: dict[str, dict] = {
    "thiết bích": {"type": "def_up", "value": 0.35, "duration": 1, "target": "self", "label": "Thiết Bích"},
    "kiên thủ": {"type": "def_up", "value": 0.2, "duration": 2, "target": "self", "label": "Kiên Thủ"},
    "kiên thủ 2": {"type": "def_up", "value": 0.25, "duration": 2, "target": "self", "label": "Kiên Thủ"},
    "thủ hộ": {"type": "def_up", "value": 0.15, "duration": 2, "target": "ally", "label": "Thủ Hộ"},
    "thủ hộ 2": {"type": "def_up", "value": 0.2, "duration": 2, "target": "ally", "label": "Thủ Hộ"},
    "đề kháng": {"type": "def_up", "value": 0.15, "duration": 2, "target": "ally", "label": "Đề Kháng"},
    "hộ thuẫn": {"type": "def_up", "value": 0.2, "duration": 1, "target": "self", "label": "Hộ Thuẫn"},
    "hộ chủ": {"type": "def_up", "value": 0.18, "duration": 2, "target": "ally", "label": "Hộ Chủ"},
    "bảo hộ": {"type": "def_up", "value": 0.15, "duration": 2, "target": "ally", "label": "Bảo Hộ"},
    "tử thủ": {"type": "def_up", "value": 0.25, "duration": 2, "target": "self", "label": "Tử Thủ"},
    "tử thủ 2": {"type": "def_up", "value": 0.3, "duration": 2, "target": "self", "label": "Tử Thủ"},
    "anh dũng": {"type": "atk_up", "value": 0.12, "duration": 2, "target": "ally", "label": "Anh Dũng"},
    "anh dũng 2": {"type": "atk_up", "value": 0.15, "duration": 2, "target": "ally", "label": "Anh Dũng"},
    "võ dũng": {"type": "atk_up", "value": 0.12, "duration": 2, "target": "self", "label": "Võ Dũng"},
    "võ dũng 2": {"type": "atk_up", "value": 0.15, "duration": 2, "target": "self", "label": "Võ Dũng"},
    "dũng tuyệt": {"type": "atk_up", "value": 0.15, "duration": 3, "target": "self", "label": "Dũng Tuyệt"},
    "bạo nộ": {"type": "atk_up", "value": 0.12, "duration": 2, "target": "self", "label": "Bạo Nộ"},
    "phấn chấn": {"type": "atk_up", "value": 0.1, "duration": 2, "target": "ally", "label": "Phấn Chấn"},
    "tăng vật công": {"type": "atk_up", "value": 0.12, "duration": 2, "target": "self", "label": "Tăng Vật Công"},
    "bá chủ": {"type": "atk_up", "value": 0.1, "duration": 2, "target": "self", "label": "Bá Chủ"},
    "bá chủ 2": {"type": "atk_up", "value": 0.12, "duration": 2, "target": "self", "label": "Bá Chủ"},
    "tăng uy": {"type": "atk_up", "value": 0.1, "duration": 2, "target": "self", "label": "Tăng Uy"},
    "hỗn loạn": {"type": "stun", "chance": 0.55, "duration": 1, "label": "Hỗn Loạn"},
    "ám tế": {"type": "silence", "chance": 0.7, "duration": 2, "label": "Ám Tế"},
    "khóa vây": {"type": "stun", "chance": 1.0, "duration": 1, "label": "Khóa Vây"},
    "khống chế": {"type": "stun", "chance": 0.4, "duration": 1, "label": "Khống Chế"},
    "ngủ say": {"type": "stun", "chance": 0.6, "duration": 1, "label": "Ngủ Say"},
    "trúng độc": {"type": "poison", "duration": 2, "label": "Trúng Độc"},
    "kịch độc": {"type": "poison", "duration": 2, "label": "Kịch Độc"},
    "thi độc": {"type": "poison", "duration": 2, "label": "Thi Độc"},
    "hủ thực": {"type": "poison", "duration": 2, "label": "Hủ Thực"},
    "thiêu đốt": {"type": "burn", "duration": 2, "label": "Thiêu Đốt"},
    "thiên hỏa": {"type": "burn", "duration": 2, "label": "Thiên Hỏa"},
    "giảm tấn công": {"type": "atk_down", "value": 0.12, "duration": 2, "label": "Giảm Công"},
    "giảm công 2": {"type": "atk_down", "value": 0.15, "duration": 2, "label": "Giảm Công"},
    "do dự": {"type": "atk_down", "value": 0.1, "duration": 2, "label": "Do Dự"},
    "e sợ": {"type": "atk_down", "value": 0.1, "duration": 2, "label": "E Sợ"},
    "hư nhược": {"type": "atk_down", "value": 0.12, "duration": 2, "label": "Hư Nhược"},
    "vô lực": {"type": "atk_down", "value": 0.12, "duration": 2, "label": "Vô Lực"},
    "hạ thấp phòng thủ": {"type": "def_down", "value": 0.12, "duration": 2, "label": "Phá Thủ"},
    "giảm phòng thủ": {"type": "def_down", "value": 0.12, "duration": 2, "label": "Phá Thủ"},
    "giảm phòng": {"type": "def_down", "value": 0.12, "duration": 2, "label": "Phá Thủ"},
    "vỡ trận": {"type": "def_down", "value": 0.15, "duration": 2, "label": "Vỡ Trận"},
    "hồi phục": {"type": "heal_pct", "value": 0.12, "target": "ally", "label": "Hồi Phục"},
    "hồi xuân": {"type": "heal_pct", "value": 0.15, "target": "ally", "label": "Hồi Xuân"},
    # wiki_buff / wiki_debuff phổ biến (combatProfiles trong status-effects.json)
    "hội tâm": {"type": "wiki_buff", "id": "hoi_tam", "kind": "buff", "duration": 2, "label": "Hội Tâm"},
    "hội tâm 2": {"type": "wiki_buff", "id": "hoi_tam", "kind": "buff", "duration": 2, "label": "Hội Tâm"},
    "âm hồn": {"type": "wiki_buff", "id": "am_hon", "kind": "buff", "duration": 2, "label": "Âm Hồn"},
    "nguyệt hồn": {"type": "wiki_buff", "id": "nguyet_hon", "kind": "buff", "duration": 2, "label": "Nguyệt Hồn"},
    "nguyệt huy": {"type": "wiki_buff", "id": "nguyet_huy", "kind": "buff", "duration": 2, "label": "Nguyệt Huy"},
    "hấp huyết": {"type": "wiki_buff", "id": "hap_huyet", "kind": "buff", "duration": 2, "label": "Hấp Huyết"},
    "nghĩa tuyệt": {"type": "wiki_buff", "id": "nghia_tuyet", "kind": "buff", "duration": 99, "label": "Nghĩa Tuyệt"},
    "tòng long": {"type": "wiki_buff", "id": "tong_long", "kind": "buff", "duration": 2, "label": "Tòng Long"},
    "tòng long 2": {"type": "wiki_buff", "id": "tong_long", "kind": "buff", "duration": 2, "label": "Tòng Long"},
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
    "điên cuồng 2": {"type": "wiki_buff", "id": "dien_cuong", "kind": "buff", "duration": 2, "label": "Điên Cuồng"},
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
    "kích nộ": {"type": "wiki_buff", "id": "kich_no", "kind": "buff", "duration": 2, "label": "Kích Nộ"},
    "thần tốc": {"type": "wiki_buff", "id": "than_toc", "kind": "buff", "duration": 2, "label": "Thần Tốc"},
    "bạch nhẫn": {"type": "wiki_buff", "id": "bach_nhan", "kind": "buff", "duration": 2, "label": "Bạch Nhẫn"},
    "kiêu binh": {"type": "wiki_buff", "id": "kieu_binh", "kind": "buff", "duration": 2, "label": "Kiêu Binh"},
    "tru thần": {"type": "wiki_debuff", "id": "tru_than", "kind": "debuff", "duration": 2, "label": "Tru Thần"},
    "liên kích": {"type": "wiki_buff", "id": "lien_kich", "kind": "buff", "duration": 2, "label": "Liên Kích"},
    "tử chiến": {"type": "wiki_buff", "id": "tu_chien", "kind": "buff", "duration": 2, "label": "Tử Chiến"},
    "đóng đô": {"type": "wiki_buff", "id": "dong_do", "kind": "buff", "duration": 2, "label": "Đóng Đô"},
    "lôi cổ 2": {"type": "wiki_buff", "id": "loi_co", "kind": "buff", "duration": 2, "label": "Lôi Cổ"},
    "lực đoạn": {"type": "wiki_buff", "id": "luc_doan", "kind": "buff", "duration": 2, "label": "Lực Đoạn"},
    "huyết nhẫn 2": {"type": "wiki_buff", "id": "huyet_nhan", "kind": "buff", "duration": 2, "label": "Huyết Nhẫn"},
    "bền bỉ": {"type": "wiki_buff", "id": "ben_bi", "kind": "buff", "duration": 2, "label": "Bền Bỉ"},
    "phục thù": {"type": "wiki_buff", "id": "phuc_thu", "kind": "buff", "duration": 2, "label": "Phục Thù"},
    "thiên tượng": {"type": "wiki_buff", "id": "thien_tuong", "kind": "buff", "duration": 2, "label": "Thiên Tượng"},
    "tỏ chí": {"type": "wiki_buff", "id": "to_chi", "kind": "buff", "duration": 2, "label": "Tỏ Chí"},
    "cô độc": {"type": "wiki_buff", "id": "co_doc", "kind": "buff", "duration": 2, "label": "Cô Độc"},
    "di kế": {"type": "wiki_buff", "id": "di_ke", "kind": "buff", "duration": 2, "label": "Di Kế"},
    "liên tục": {"type": "wiki_buff", "id": "lien_tuc", "kind": "buff", "duration": 2, "label": "Liên Tục"},
    "bất khuất": {"type": "wiki_buff", "id": "bat_khuat", "kind": "buff", "duration": 1, "label": "Bất Khuất"},
    "bất khuất 2": {"type": "wiki_buff", "id": "bat_khuat", "kind": "buff", "duration": 1, "label": "Bất Khuất"},
    "thương tích": {"type": "wiki_debuff", "id": "thuong_tich", "kind": "debuff", "duration": 2, "label": "Thương Tích"},
    "áp chế": {"type": "wiki_buff", "id": "ap_che", "kind": "buff", "duration": 2, "label": "Áp Chế"},
    "áp chế 2": {"type": "wiki_buff", "id": "ap_che", "kind": "buff", "duration": 2, "label": "Áp Chế"},
    "vong đoạn": {"type": "wiki_buff", "id": "vong_doan", "kind": "buff", "duration": 2, "label": "Vong Đoạn"},
    "thống quân": {"type": "wiki_buff", "id": "thong_quan", "kind": "buff", "duration": 2, "label": "Thống Quân"},
    "vô ngôn": {"type": "silence", "chance": 0.65, "duration": 2, "label": "Vô Ngôn"},
    "ma ám": {"type": "wiki_debuff", "id": "ma_am", "kind": "debuff", "duration": 2, "label": "Ma Ám"},
    "tàn tạ": {"type": "wiki_debuff", "id": "tan_ta", "kind": "debuff", "duration": 2, "label": "Tàn Tạ"},
    "vô tình": {"type": "wiki_buff", "id": "vo_tinh", "kind": "buff", "duration": 2, "label": "Vô Tình"},
    "giẫm đạp": {"type": "wiki_debuff", "id": "giam_dap", "kind": "debuff", "duration": 2, "label": "Giẫm Đạp"},
    "kỳ trận": {"type": "wiki_buff", "id": "ky_tran", "kind": "buff", "duration": 2, "label": "Kỳ Trận"},
    "trảm tiên": {"type": "wiki_buff", "id": "tram_tien", "kind": "buff", "duration": 2, "label": "Trảm Tiên"},
    "dục huyết": {"type": "wiki_buff", "id": "duc_huyet", "kind": "buff", "duration": 2, "label": "Dục Huyết"},
    "huyết thuẫn": {"type": "def_up", "value": 0.2, "duration": 2, "target": "self", "label": "Huyết Thuẫn"},
    "huyết thuẫn 2": {"type": "def_up", "value": 0.25, "duration": 2, "target": "self", "label": "Huyết Thuẫn"},
    "thanh long 2": {"type": "wiki_buff", "id": "thanh_long", "kind": "buff", "duration": 2, "label": "Thanh Long"},
    "tước đoạt": {"type": "wiki_buff", "id": "tuoc_doat", "kind": "buff", "duration": 2, "label": "Tước Đoạt"},
    "kinh cúc": {"type": "wiki_buff", "id": "kinh_cuc", "kind": "buff", "duration": 2, "label": "Kinh Cúc"},
    "điệp nhẫn": {"type": "wiki_buff", "id": "diep_nhan", "kind": "buff", "duration": 2, "label": "Điệp Nhẫn"},
    "minh triết": {"type": "wiki_buff", "id": "minh_triet", "kind": "buff", "duration": 2, "label": "Minh Triết"},
    "chuyển đổi": {"type": "wiki_buff", "id": "chuyen_doi", "kind": "buff", "duration": 2, "label": "Chuyển Đổi"},
    "mây đen": {"type": "wiki_debuff", "id": "may_den", "kind": "debuff", "duration": 2, "label": "Mây Đen"},
    "dị nhiễu": {"type": "wiki_debuff", "id": "di_nhieu", "kind": "debuff", "duration": 2, "label": "Dị Nhiễu"},
}


def load_wiki_catalog() -> list[dict]:
    path = DATA / "status-effects.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    return list(data.get("wikiCatalog") or [])


def slug_id(name: str) -> str:
    s = unicodedata.normalize("NFC", name or "").strip().lower()
    repl = {
        "à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a",
        "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a",
        "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
        "è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e",
        "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
        "ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
        "ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o",
        "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o",
        "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
        "ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u",
        "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
        "ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y",
        "đ": "d",
    }
    chars = []
    for ch in s:
        chars.append(repl.get(ch, ch))
    s = "".join(chars)
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s or "buff"


def catalog_effect(entry: dict) -> dict:
    """Map 1 dòng wikiCatalog → effect engine (fallback khi chưa có NAME_MAP)."""
    name = (entry.get("name") or "").strip()
    key = name.lower()
    kind = entry.get("kind") or "buff"
    eid = entry.get("id") or slug_id(name)
    label = name

    # Heuristic theo tên / mô tả
    blob = f"{key} {(entry.get('desc') or '').lower()}"
    if any(w in blob for w in ("hỗn loạn", "choáng", "ngủ say", "khống chế", "đóng băng", "tê liệt", "mê hoặc")):
        return {"type": "stun", "chance": 0.55, "duration": 1, "label": label}
    if any(w in blob for w in ("ám tế", "vô ngôn", "câm")):
        return {"type": "silence", "chance": 0.65, "duration": 2, "label": label}
    if any(w in blob for w in ("trúng độc", "kịch độc", "thi độc", "hủ thực", "độc")):
        return {"type": "poison", "duration": 2, "label": label}
    if any(w in blob for w in ("thiêu đốt", "thiên hỏa", "hỏa")) and "giảm" not in blob[:20]:
        if "thiêu" in blob or "thiên hỏa" in blob:
            return {"type": "burn", "duration": 2, "label": label}
    if any(w in blob for w in ("phòng thủ", "phòng ", "kiên thủ", "hộ ", "thiết bích", "thuẫn")):
        if kind in ("debuff",) or "giảm" in blob or "phá" in blob:
            return {"type": "def_down", "value": 0.12, "duration": 2, "label": label}
        return {"type": "def_up", "value": 0.15, "duration": 2, "target": "self", "label": label}
    if any(w in blob for w in ("tấn công", "vật công", "pháp công", "anh dũng", "võ ", "công tăng", "tăng công")):
        if kind == "debuff" or "giảm" in blob:
            return {"type": "atk_down", "value": 0.1, "duration": 2, "label": label}
        return {"type": "atk_up", "value": 0.1, "duration": 2, "target": "self", "label": label}

    if kind == "debuff" or kind == "control":
        return {
            "type": "wiki_debuff",
            "id": eid,
            "kind": "control" if kind == "control" else "debuff",
            "duration": 1 if kind == "control" else 2,
            "label": label,
        }
    return {
        "type": "wiki_buff",
        "id": eid,
        "kind": "buff" if kind != "unremovable" else "buff",
        "duration": 2,
        "label": label,
    }


def build_full_name_map(catalog: list[dict] | None = None) -> dict[str, dict]:
    catalog = catalog if catalog is not None else load_wiki_catalog()
    out: dict[str, dict] = {}
    for c in catalog:
        name = (c.get("name") or "").strip()
        if not name:
            continue
        key = name.lower()
        if key in SKIP_BRACKETS:
            continue
        out[key] = catalog_effect(c)
        # alias bỏ hậu tố " 2"
        base = re.sub(r"\s*2$", "", key).strip()
        if base and base not in out:
            out[base] = dict(out[key])
            out[base]["label"] = re.sub(r"\s*2$", "", name).strip() or name
    # Hard overrides thắng auto
    out.update({k: dict(v) for k, v in NAME_MAP.items()})
    return out


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
    d = (desc or "").lower()
    idx = d.find(f"[{name.lower()}]")
    before = d[max(0, idx - 48) : idx] if idx >= 0 else d
    if "bản thân nhận" in before or "bản thân vào" in before or "bản thân " in before[-12:]:
        return "self"
    if "toàn phe ta" in before or "phe ta nhận" in before or "đồng đội" in before:
        return "ally"
    return default


def has_troop_heal(desc: str) -> bool:
    d = (desc or "").lower()
    if "trị liệu" in d:
        return True
    if re.search(r"hồi\s*(phục\s*)?(lính|binh(\s*lực)?|sinh\s*lực|khí\s*huyết)", d):
        return True
    if re.search(r"hồi\s*phục(?!\s*sĩ\s*khí)", d) and "sĩ khí" not in d[max(0, d.find("hồi phục") - 5) : d.find("hồi phục") + 30]:
        # [Hồi Phục] bracket handled separately; plain «hồi phục» without sĩ khí nearby
        return "sĩ khí" not in d
    return False


def has_morale_gain(desc: str) -> bool:
    d = (desc or "").lower()
    if re.search(r"(hồi|nhận|tăng)\s*.{0,16}sĩ\s*khí", d):
        return True
    if re.search(r"sĩ\s*khí.{0,12}(hồi|nhận|\+|tăng)", d):
        return True
    return False


def parse_morale_value(desc: str) -> int:
    d = desc or ""
    m = re.search(r"(?:hồi|nhận|tăng)\s*(\d+)\s*\+?\s*\{?[^}]*\}?\s*sĩ\s*khí", d, re.I)
    if m:
        return max(10, min(80, int(m.group(1))))
    m2 = re.search(r"(\d+)\s*\+?\s*\{[^}]*\}\s*sĩ\s*khí", d, re.I)
    if m2:
        return max(10, min(80, int(m2.group(1))))
    return 40


def effects_from_desc(desc: str, name_map: dict[str, dict] | None = None) -> list[dict]:
    nm = name_map or build_full_name_map()
    out: list[dict] = []
    seen: set[str] = set()

    for raw in brackets(desc):
        key = raw.strip().lower()
        # bỏ tag kỹ thuật / số sĩ khí thuần
        if key in SKIP_BRACKETS:
            continue
        if re.match(r"^\d+\s*sĩ\s*khí", key) or "thi triển" in key and "sĩ khí" in key:
            continue
        if key.startswith("treo thưởng không thể"):
            key = "treo thưởng"
        # cắt bracket lồng / quá dài
        if len(key) > 40:
            continue
        spec = nm.get(key)
        if not spec:
            # thử bỏ hậu tố 2
            base = re.sub(r"\s*2$", "", key).strip()
            spec = nm.get(base)
        if not spec:
            continue
        e = dict(spec)
        # heal bracket chỉ giữ nếu thật sự heal lính hoặc đúng label Hồi Phục trong ngữ cảnh trị liệu
        if e.get("type") == "heal_pct" and not has_troop_heal(desc) and key not in ("hồi phục", "hồi xuân"):
            continue
        if e.get("type") == "heal_pct" and key in ("hồi phục", "hồi xuân") and not has_troop_heal(desc):
            # bracket đơn nhưng desc chỉ nói sĩ khí → bỏ
            if has_morale_gain(desc) and "trị liệu" not in (desc or "").lower():
                continue
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

    # Morale / heal từ câu chữ (không phụ thuộc bracket)
    if has_morale_gain(desc):
        e = {"type": "morale_boost", "value": parse_morale_value(desc), "target": "self", "label": "Sĩ Khí"}
        dk = f"{e['type']}:{e.get('label')}"
        if dk not in seen:
            seen.add(dk)
            out.append(e)
    if has_troop_heal(desc):
        # tránh trùng heal_pct đã có
        if not any(x.get("type") == "heal_pct" for x in out):
            e = {"type": "heal_pct", "value": 0.12, "target": "ally", "label": "Trị Liệu"}
            out.append(e)

    # Keyword fallback nếu chưa có effect cứng phổ biến
    d = (desc or "").lower()
    fallbacks = [
        ("thiết bích", "thiết bích"),
        ("hỗn loạn", "hỗn loạn"),
        ("ám tế", "ám tế"),
        ("khóa vây", "khóa vây"),
        ("trúng độc", "trúng độc"),
        ("thiêu đốt", "thiêu đốt"),
        ("anh dũng", "anh dũng"),
        ("kiên thủ", "kiên thủ"),
    ]
    for needle, map_key in fallbacks:
        if needle in d and map_key in nm:
            e = dict(nm[map_key])
            dk = f"{e.get('type')}:{e.get('id') or ''}:{e.get('label') or ''}"
            if dk not in seen:
                seen.add(dk)
                out.append(e)

    return out


def infer_pattern(desc: str) -> str:
    d = (desc or "").lower()
    if re.search(r"toàn\s*(phe\s*)?(địch|quân địch)|tất cả.*(địch|quân)", d):
        return "all"
    # hàng dọc trước hàng trước (desc hay nhắc thêm «hàng trước/sau» phụ)
    if re.search(r"hàng\s*dọc|đường\s*thẳng", d):
        return "column"
    if re.search(r"hàng\s*ngang", d):
        return "row"
    if re.search(r"hàng\s*trước", d) and not re.search(r"hàng\s*(sau|dọc)", d):
        return "front_row"
    # chỉ ally khi không phá địch
    if re.search(r"đồng\s*đội|phe\s*ta|toàn\s*quân\s*ta", d) and not re.search(
        r"địch|kẻ địch|pháp công|vật công|mưu công", d
    ):
        return "ally_all"
    if re.search(r"bản\s*thân", d) and not re.search(r"kẻ địch|địch|pháp công|vật công", d):
        return "self"
    return "single"


def parse_hits(desc: str) -> int:
    m = re.search(r"(\d+)\s*lần", desc or "", re.I)
    if m:
        return max(1, min(5, int(m.group(1))))
    if re.search(r"2\s*nhịp|hai\s*lần|×\s*2|x2", desc or "", re.I):
        return 2
    return 1


def infer_motif_flash(name: str, desc: str, pattern: str | None = None) -> tuple[str, str]:
    """Return (motif, flash) — bám FLASH_MAP + rule QA test-skill-fx (tên chiêu)."""
    raw_name = name or ""
    n = raw_name.lower()
    d = (desc or "").lower()
    blob = n + " " + d
    pat = pattern or infer_pattern(desc)

    # Rule cứng theo TÊN — mở rộng full catalog (QA + audit mọi chiêu)
    named_rules: list[tuple[re.Pattern[str], str, str]] = [
        (re.compile(r"Giáp|Thiết Bích|Hộ Thể|Thủ Hộ|Lấy Thân Làm Giáp|Hãn Vệ", re.I), "shield", "shield"),
        (
            re.compile(
                r"Đột Kích|Tập Kích|Xung Phong|Nghịch Tập|Tiên Đăng|Đột Tiến|Đột Tập|"
                r"Cường Tập|Nộ Tập|Tật Xung|Nỗ Tập|Lõa Y Nộ Tập|Xả Thân Cường Tập",
                re.I,
            ),
            "rush",
            "rush",
        ),
        (
            re.compile(
                r"Kỵ Liệp|Kỵ Kích|Kỵ Chiến|Chiến Kỵ|Đơn Kỵ|Thiết Kỵ|Nhất Kỵ|"
                r"Thiên Lý Đơn Kỵ|Bạch Kỵ|Kỵ Thần|Tây Lương",
                re.I,
            ),
            "charge",
            "charge",
        ),
        (re.compile(r"Phong Tiễn", re.I), "whirlwind", "whirlwind"),
        (re.compile(r"Hỏa Long Tiễn|Long Tiễn", re.I), "dragon", "dragon"),
        (re.compile(r"Hỏa .{0,6}Tiễn|Viêm .{0,4}Tiễn", re.I), "fire", "fire_rain"),
        (
            re.compile(
                r"Lôi Tiễn|Kinh Lôi|Lôi Kích|Thần Lôi|Xích Lôi|Tử Điện|Lôi Oanh|"
                r"Cửu Thiên Thần Lôi|Kinh Thiên Bạo Lôi|Cửu Tiêu Thần Lôi",
                re.I,
            ),
            "thunder",
            "thunder",
        ),
        # Cung / tiễn / nỏ — trước shadow/blood
        (
            re.compile(
                r"Tiễn|Nghệ Xạ|Thần Xạ|Mũi Nhọn|Liệt Thỉ|Thỉ$|Tề Xạ|Xạ Sát|Phi Xạ|"
                r"Liên Nỏ|Kỵ Xạ|Xạ Thủ|Kình Nỏ|Giương Cung|Nỏ ",
                re.I,
            ),
            "pierce",
            "yellow",
        ),
        (re.compile(r"Lang |Sói|Lang Tuyền", re.I), "wolf", "wolf"),
        (
            re.compile(
                r"Hổ Khiếu|Hổ Bôn|Hùng Hổ|Hổ Xung|Hổ Sát|Mãnh Hổ|Hổ Tri|Triệu Hổ",
                re.I,
            ),
            "tiger",
            "tiger",
        ),
        (
            re.compile(
                r"Thanh Long|Bạch Long|Ngân Long|Thiên Long|Phục Long|Đằng Long|"
                r"Địa Long|Hỏa Long|Thương Long",
                re.I,
            ),
            "dragon",
            "dragon",
        ),
        (
            re.compile(
                r"Thiên Hỏa|Hỏa Vũ|Hỏa Ngưu|Hỏa Thiêu|Hỏa Thần|Đại Viêm|Hồng Viêm|"
                r"Hắc Viêm|Luyện Ngục|Xích Lửa|Xích Lửa Trí Tuệ|Lửa Lục",
                re.I,
            ),
            "fire",
            "fire_rain",
        ),
        (re.compile(r"Độc Địa|Độc Xà|Độc Tiêu|Xà Độc|Độc ", re.I), "poison", "green_poison"),
        (
            re.compile(
                r"Bát Trận|Kỳ Môn|Bát Quái|Chiến Trận|Phá Trận|Thương Trận|Ngũ Hành",
                re.I,
            ),
            "bagua",
            "bagua",
        ),
        (
            re.compile(
                r"Lạc Thủy|Thủy Chiến|Hồng Thủy|Vũ Thánh|Xích Vũ|Thiên Vũ|"
                r"Phượng Vũ|Vũ Điệu|Vũ Khuynh",
                re.I,
            ),
            "water",
            "blue_water",
        ),
        (
            re.compile(
                r"Gió Lốc|Dòng Xoáy|Lướt Nhanh Như Gió|Cuồng Phong|Phong Lôi|"
                r"Đông Phong|Thần Phong|Băng Phong|Phong Hầu|Uy Phong|Tang Phong",
                re.I,
            ),
            "whirlwind",
            "whirlwind",
        ),
        # Mưu / ám / kế
        (
            re.compile(
                r"Kỳ Mưu|Ẩn Mưu|Liên Hoàn Kế|Quỷ Cốc|Định Kế|Ám |Huyền |"
                r"Tấu Sát|Khu Trục|Hiệu Lệnh",
                re.I,
            ),
            "shadow",
            "purple",
        ),
        # Huyết / sát — son crimson (KHÔNG dùng substring «huyết» trong «thuyết»)
        (
            re.compile(
                r"(?:^|[\s·])Huyết|"
                r"Nộ Sát|Bác Sát|Quỷ Sát|Tấu Sát|"
                r"Huyết Chiến|Huyết Quỷ|Huyết Chinh|Huyết Nhẫn|Huyết Trảm|"
                r"Huyết Lộ|Huyết Chế|Huyết Ách|Mục Huyết|Huyết Phủ",
                re.I,
            ),
            "slash",
            "crimson",
        ),
        (re.compile(r"Loan Hồi|Hồi Phượng|Nhân Đức|Cam Vũ|Hồi Xuân|Trị Liệu", re.I), "heal", "gold_soft"),
        # Không Thành / mưu kế truyền thuyết
        (re.compile(r"Không Thành", re.I), "bagua", "bagua"),
    ]
    for cre, motif, flash in named_rules:
        if cre.search(raw_name):
            return motif, flash

    # Desc / keyword bổ sung
    if any(k in n for k in ("thiết bích", "hộ thể", "hộ thuẫn", "kiên thủ", "ngự giáp")) or (
        "thiết bích" in d and pat in ("self", "ally_all")
    ):
        return "shield", "shield"
    if "kỵ" in n and not any(k in n for k in ("xạ", "cung", "nỏ")):
        if pat not in ("ally_all", "self") and not has_troop_heal(desc):
            return "charge", "charge"
    if any(k in n for k in ("thích", "xuyên", "liên thích", "thâu tâm")) or re.search(
        r"thích\s|xuyên\s", n
    ):
        return "pierce", "steel"
    if any(k in blob for k in ("xoáy", "lốc", "dòng xoáy", "cuồng phong")):
        return "whirlwind", "whirlwind"
    if "hổ" in n:
        return "tiger", "tiger"
    if any(k in blob for k in ("rồng", "long ", "thương long", "hỏa long", "long nỗ")):
        return "dragon", "dragon"
    if "xà" in n or "rắn" in blob or "độc xà" in blob:
        return "snake", "snake"
    if "lửa lục" in n or "fire_green" in n:
        return "poison", "fire_green"
    if any(k in n for k in ("hỏa", "viêm", "lửa")) and "long" not in n:
        return "fire", "fire_rain"
    if any(k in blob for k in ("lôi", "sét", "điện", "sấm")):
        return "thunder", "thunder"
    if any(k in n for k in ("thủy", "hải", " vũ", "vũ ")):
        return "water", "blue_water"
    if any(k in blob for k in ("độc", "trúng độc", "kịch độc", "hủ thực")):
        return "poison", "green_poison"
    if any(k in blob for k in ("bát quái", "không thành", "huyễn", "kỳ môn", "phá trận", "chiến trận")):
        return "bagua", "bagua"
    if any(k in blob for k in ("trị liệu", "cam vũ", "nhân đức", "hồi xuân", "loan hồi")) or (
        has_troop_heal(desc) and pat in ("ally_all", "self") and "địch" not in d
    ):
        return "heal", "gold_soft"
    if any(k in n for k in ("ám ", "ám sát", "ám dạ", "ám tập", "ẩn mưu", "kỳ mưu", "quỷ cốc")):
        return "shadow", "purple"
    if re.search(r"(?:^|[\s·])huyết|nộ sát|quỷ sát|bác sát|máu", n):
        return "slash", "crimson"
    if "không thành" in n:
        return "bagua", "bagua"
    if any(k in n for k in ("phong ", "phong", "gió")) and "long" not in n:
        return "whirlwind", "whirlwind"
    if any(k in n for k in ("đột ", "đột tiến", "đột tập", "cường tập", "nộ tập", "tật xung")):
        return "rush", "rush"
    if re.search(r"xạ|nỏ|cung", n) and "thương" not in n:
        return "pierce", "yellow"

    if pat in ("self", "ally_all"):
        return "buff", "gold_soft"
    if "[kế sách]" in d or "mưu công" in d or "kỳ mưu" in n or "kế" in n:
        return "arcane", "blue"
    return "slash", "steel"


def infer_combat_profile(entry: dict) -> dict:
    """Profile số cho wiki_buff id — engine đọc combatProfiles."""
    name = (entry.get("name") or "").lower()
    desc = (entry.get("desc") or "").lower()
    kind = entry.get("kind") or "buff"
    blob = name + " " + desc
    profile: dict = {"kind": kind}

    if kind in ("buff", "unremovable"):
        if any(w in blob for w in ("phòng", "thủ", "hộ", "thuẫn", "kiên", "bất khuất")):
            profile["defMul"] = 0.15
        if any(w in blob for w in ("công", "võ", "anh dũng", "phấn", "bạo", "nhẫn", "sát thương")):
            profile["atkMul"] = 0.1
        if any(w in blob for w in ("trị liệu", "hồi", "hấp huyết", "dục huyết")):
            profile["lifesteal"] = 0.08
        if any(w in blob for w in ("sĩ khí", "diệu kế")):
            profile["moralePerTurn"] = 10
        if "defMul" not in profile and "atkMul" not in profile:
            # default nhẹ theo kind
            profile["atkMul"] = 0.08 if "công" in blob or "sát" in blob else 0.06
            if "phòng" in blob:
                profile["defMul"] = 0.1
    elif kind == "debuff":
        if any(w in blob for w in ("phòng", "thủ", "phá")):
            profile["defDown"] = 0.12
        if any(w in blob for w in ("công", "yếu", "sợ", "e sợ", "do dự", "hư nhược")):
            profile["atkDown"] = 0.1
        if "defDown" not in profile and "atkDown" not in profile:
            profile["atkDown"] = 0.08
    elif kind == "control":
        profile["stun"] = True

    return profile


def build_combat_profiles(catalog: list[dict] | None = None) -> dict[str, dict]:
    catalog = catalog if catalog is not None else load_wiki_catalog()
    profiles: dict[str, dict] = {}
    for c in catalog:
        eid = c.get("id") or slug_id(c.get("name") or "")
        if not eid:
            continue
        profiles[eid] = infer_combat_profile(c)

    # Overrides tay cho id đang dùng nhiều trong skills
    overrides = {
        "hoi_tam": {"kind": "buff", "atkMul": 0.1, "defMul": 0.05},
        "am_hon": {"kind": "buff", "atkMul": 0.12},
        "nguyet_hon": {"kind": "buff", "atkMul": 0.1},
        "nguyet_huy": {"kind": "buff", "atkMul": 0.1},
        "hap_huyet": {"kind": "buff", "lifesteal": 0.12, "atkMul": 0.05},
        "than_binh": {"kind": "buff", "atkMul": 0.12, "defMul": 0.08},
        "thien_van": {"kind": "buff", "atkMul": 0.08, "defMul": 0.08},
        "dien_cuong": {"kind": "buff", "atkMul": 0.15},
        "thau_suot": {"kind": "buff", "atkMul": 0.1},
        "phan_kich": {"kind": "buff", "atkMul": 0.08},
        "bat_quai": {"kind": "buff", "defMul": 0.2},
        "ben_bi": {"kind": "buff", "defMul": 0.12},
        "tu_chien": {"kind": "buff", "atkMul": 0.15},
        "luc_doan": {"kind": "buff", "atkMul": 0.12},
        "huyet_nhan": {"kind": "buff", "atkMul": 0.12, "lifesteal": 0.05},
        "tong_long": {"kind": "buff", "atkMul": 0.1, "defMul": 0.1},
        "treo_thuong": {"kind": "debuff", "defDown": 0.1, "atkDown": 0.05},
        "dao_binh": {"kind": "debuff", "atkDown": 0.12},
        "so_hai": {"kind": "debuff", "atkDown": 0.12},
        "ap_uc": {"kind": "debuff", "atkDown": 0.1, "defDown": 0.05},
        "toa_binh": {"kind": "debuff", "atkDown": 0.1},
        "me_hoac": {"kind": "control", "stun": True},
        "te_liet": {"kind": "control", "stun": True},
        "dong_bang": {"kind": "control", "stun": True},
        "pha_thanh": {"kind": "debuff", "defDown": 0.15},
        "loai_bo": {"kind": "debuff", "defDown": 0.1},
        "huyet_cuc": {"kind": "debuff", "atkDown": 0.08},
        "ma_am": {"kind": "debuff", "atkDown": 0.1},
        "thuong_tich": {"kind": "debuff", "defDown": 0.1},
        "thanh_long": {"kind": "buff", "atkMul": 0.12, "defMul": 0.08},
        "di_nhieu": {"kind": "debuff", "atkDown": 0.1},
    }
    profiles.update(overrides)
    return profiles
