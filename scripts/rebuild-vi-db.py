# -*- coding: utf-8 -*-
"""Rebuild Vietnamese UTF-8 for generals.json + recruit.json + nl-db.bundle.js."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Roster from scripts/build-generals.ps1 (authoritative names)
ROWS = r"""
liubei|Lưu Bị|shu|orange|infantry|92|68|78|3200|nhan_duc|minh_chu|starter|0
guanyu|Quan Vũ|shu|red|cavalry|85|98|72|3400|wu_sheng|ngu_ho_tuong|starter|0
zhangfei|Trương Phi|shu|orange|infantry|78|96|45|3600|gam_thet|ngu_ho_tuong|starter|0
zhaoyun|Triệu Vân|shu|red|cavalry|88|94|70|3300|long_dam|ngu_ho_tuong|recruit|0
zhugeliang|Gia Cát Lượng|shu|red|archer|80|42|100|2600|khong_thanh|quan_su,ngoa_long|campaign|0
huangzhong|Hoàng Trung|shu|orange|archer|70|93|55|2800|bach_bo|ngu_ho_tuong|recruit|0
machao|Mã Siêu|shu|orange|cavalry|75|95|48|3100|tay_luong|ngu_ho_tuong|recruit|0
pangtong|Bàng Thống|shu|purple|archer|72|40|94|2500|phung_so|quan_su|recruit|0
weiyan|Ngụy Diên|shu|purple|spear|74|88|52|3000|phan_cot||recruit|0
liufeng|Lưu Phong|shu|blue|infantry|62|70|48|2400|basic_strike||recruit|0
guanying|Quan Bình|shu|blue|cavalry|60|72|50|2350|basic_strike||recruit|0
zhangbao_shu|Trương Bào|shu|blue|infantry|58|74|42|2450|basic_strike||recruit|0
jiangwei|Khương Duy|shu|orange|spear|82|84|88|3000|basic_scheme|quan_su|campaign|0
fazheng|Pháp Chính|shu|purple|archer|70|45|92|2480|an_muu|quan_su|recruit|0
xushu|Từ Thứ|shu|purple|archer|74|48|90|2520|basic_scheme|quan_su|recruit|0
madai|Mã Đại|shu|blue|cavalry|64|78|45|2500|basic_strike||recruit|0
liaohua|Liêu Hóa|shu|green|spear|55|62|40|2100|basic_strike||recruit|0
wangping|Vương Bình|shu|blue|infantry|72|65|58|2550|basic_strike||recruit|0
caocao|Tào Tháo|wei|red|cavalry|95|78|90|3350|ho_khi|minh_chu|starter|0
simayi|Tư Mã Ý|wei|red|archer|82|48|98|2700|an_muu|quan_su|recruit|0
xuchu|Hứa Chử|wei|orange|infantry|70|97|30|3800|ho_si||starter|0
dianwei|Điển Vi|wei|orange|infantry|72|96|35|3700|co_chien||starter|0
jiaxu|Giả Hủ|wei|purple|archer|76|38|96|2550|doc_muu|quan_su|recruit|0
zhangliao|Trương Liêu|wei|orange|cavalry|86|90|68|3150|xiaoyaojin||recruit|0
xuhuang|Từ Hoảng|wei|purple|spear|84|86|60|3200|basic_strike||recruit|0
zhanghe|Trương Cáp|wei|purple|cavalry|80|85|70|3050|basic_strike||recruit|0
yuejin|Nhạc Tiến|wei|blue|infantry|68|80|42|2700|basic_strike||recruit|0
licadian|Lý Điển|wei|blue|spear|70|72|75|2600|basic_scheme||recruit|0
guojia|Quách Gia|wei|orange|archer|72|40|97|2450|an_muu|quan_su|recruit|0
xunyu|Tuân Úc|wei|purple|archer|78|35|93|2400|basic_scheme|quan_su|recruit|0
xunyou|Tuân Du|wei|purple|archer|74|38|91|2380|basic_scheme|quan_su|recruit|0
caoren|Tào Nhân|wei|purple|infantry|88|78|55|3300|basic_strike||recruit|0
caopi|Tào Phi|wei|orange|infantry|85|72|80|3000|ho_khi|minh_chu|campaign|0
xiahou_dun|Hạ Hầu Đôn|wei|orange|infantry|82|88|58|3200|basic_strike||recruit|0
xiahou_yuan|Hạ Hầu Uyên|wei|purple|cavalry|76|87|55|3000|basic_strike||recruit|0
sunquan|Tôn Quyền|wu|orange|infantry|90|70|82|3100|dong_ngo|minh_chu|starter|0
zhouyu|Chu Du|wu|red|archer|78|72|96|2750|hoa_cong|quan_su|starter|0
luxun|Lục Tốn|wu|orange|archer|80|55|93|2650|lua_luc|quan_su|recruit|0
taishici|Thái Sử Từ|wu|purple|archer|74|89|58|2900|bach_bo||recruit|0
ganning|Cam Ninh|wu|purple|cavalry|72|91|50|2950|basic_strike||recruit|0
huanggai|Hoàng Cái|wu|blue|spear|76|82|55|3000|hoa_cong||starter|0
zhouzhi|Chu Thái|wu|blue|infantry|70|80|40|2850|basic_strike||recruit|0
lingtong|Lăng Thống|wu|blue|cavalry|68|82|48|2750|basic_strike||recruit|0
lusu|Lỗ Túc|wu|purple|archer|80|42|88|2500|basic_scheme|quan_su|recruit|0
zhugejin|Gia Cát Cẩn|wu|blue|archer|72|40|82|2400|basic_scheme|quan_su|recruit|0
sunce|Tôn Sách|wu|orange|cavalry|78|92|60|3200|tay_luong|minh_chu|campaign|0
sunjian|Tôn Kiên|wu|purple|infantry|80|86|55|3100|basic_strike||campaign|0
xiaoqiao|Tiểu Kiều|wu|purple|archer|55|30|85|2200|basic_scheme||recruit|0
daqiao|Đại Kiều|wu|blue|archer|52|28|80|2100|basic_scheme||recruit|0
zhangzhao|Trương Chiêu|wu|blue|archer|75|25|84|2300|basic_scheme|quan_su|recruit|0
chengpu|Trình Phổ|wu|green|spear|60|68|45|2300|basic_strike||recruit|0
handang|Hàn Đương|wu|green|infantry|58|70|40|2250|basic_strike||recruit|0
recruit_guard|Thủ Vệ|other|white|infantry|40|42|30|1600|basic_strike|generic|recruit|0
recruit_scout|Do Thám|other|white|archer|35|38|45|1400|basic_scheme|generic|recruit|0
recruit_militia|Dân Binh|other|white|spear|38|40|28|1550|basic_strike|generic|recruit|0
recruit_porter|Phu Dịch|other|white|infantry|32|30|25|1300|basic_strike|generic|recruit|0
recruit_rider|Kỵ Binh|other|green|cavalry|48|55|32|1900|basic_strike|generic|recruit|0
recruit_spearman|Thương Thủ|other|green|spear|52|50|35|2000|basic_strike|generic|recruit|0
recruit_crossbow|Nỏ Thủ|other|green|archer|45|48|50|1800|basic_scheme|generic|recruit|0
recruit_blade|Đao Phủ|other|green|infantry|50|58|30|1950|basic_strike|generic|recruit|0
veteran_guard|Lão Binh|other|blue|infantry|62|65|40|2400|basic_strike|generic|recruit|0
veteran_rider|Thiết Kỵ|other|blue|cavalry|60|72|38|2500|basic_strike|generic|recruit|0
veteran_spear|Trường Thương|other|blue|spear|66|68|42|2550|basic_strike|generic|recruit|0
veteran_archer|Thiện Xạ|other|blue|archer|55|60|68|2300|bach_bo|generic|recruit|0
elite_vanguard|Tinh Nhuệ|other|purple|infantry|74|80|50|3000|basic_strike|generic|recruit|0
elite_raider|Kỳ Binh|other|purple|cavalry|70|86|48|2950|basic_strike|generic|recruit|0
zhangbao|Trương Bảo|yellow|blue|spear|60|70|75|2400|basic_scheme|boss_ch1|campaign|1
zhangliang|Trương Lương|yellow|blue|archer|58|65|80|2300|basic_scheme|boss_ch1|campaign|1
zhangjiao|Trương Giác|yellow|purple|archer|70|55|92|4200|huang_tian|boss_ch1,chapter_boss|campaign|1
yellow_zealot|Khăn Vàng Tử Sĩ|yellow|green|infantry|48|55|40|2000|basic_strike|boss_ch1|campaign|1
yellow_shaman|Khăn Vàng Vu|yellow|green|archer|42|35|62|1750|basic_scheme|boss_ch1|campaign|1
yellow_captain|Khăn Vàng Hiệu|yellow|blue|spear|58|68|50|2300|basic_strike|boss_ch1|campaign|1
huaxiong|Hoa Hùng|dongzhuo|purple|cavalry|72|90|40|3800|hoa_hung_slash|boss_ch2|campaign|1
lubu|Lã Bố|dongzhuo|red|cavalry|88|100|45|5200|lu_bu_fury|boss_ch2,chapter_boss|campaign|1
dongzhuo|Đổng Trác|dongzhuo|orange|infantry|65|80|50|4500|ho_si|boss_ch2|campaign|1
liru|Lý Nho|dongzhuo|purple|archer|70|40|88|2600|doc_muu|boss_ch2|campaign|1
liuru|Lý Thôi|dongzhuo|blue|cavalry|60|75|40|2700|basic_strike|boss_ch2|campaign|1
guosi|Quách Dĩ|dongzhuo|blue|infantry|58|78|35|2750|basic_strike|boss_ch2|campaign|1
fancho|Phàn Trù|dongzhuo|green|spear|52|70|30|2200|basic_strike|boss_ch2|campaign|1
zhangji_dz|Trương Tế|dongzhuo|green|cavalry|50|68|32|2150|basic_strike|boss_ch2|campaign|1
yuanshao|Viên Thiệu|yuan|orange|archer|88|70|75|4000|basic_scheme|boss_ch3|campaign|1
yuan_shu|Viên Thuật|yuan|purple|infantry|70|72|60|3400|basic_strike|boss_ch3|campaign|1
gongsunzan|Công Tôn Toản|other|purple|cavalry|78|86|55|3600|tay_luong|boss_ch3|campaign|1
liubiao|Lưu Biểu|other|purple|archer|82|50|78|3200|basic_scheme|boss_ch3|campaign|1
liuzhang|Lưu Chương|other|blue|infantry|65|45|70|2800|basic_scheme|boss_ch3|campaign|1
yanliang|Nhan Lương|yuan|purple|cavalry|72|92|40|3400|basic_strike|boss_ch3|campaign|1
wenchou|Văn Xú|yuan|purple|cavalry|70|90|42|3350|basic_strike|boss_ch3|campaign|1
tianfeng|Điền Phong|yuan|blue|archer|68|35|85|2400|basic_scheme|boss_ch3|campaign|1
jushou|Thư Thụ|yuan|blue|archer|70|32|84|2380|basic_scheme|boss_ch3|campaign|1
kongrong|Khổng Dung|other|green|archer|55|25|75|2000|basic_scheme|boss_ch3|campaign|1
taogian|Đào Khiêm|other|green|infantry|60|40|65|2100|basic_scheme|boss_ch3|campaign|1
hanxuan|Hàn Huyền|other|green|infantry|48|50|45|2000|basic_strike|boss_ch3|campaign|1
"""


def fix_mojibake(s: str) -> str:
    """Fix UTF-8 bytes that were decoded as latin-1/cp1252."""
    if not isinstance(s, str):
        return s
    # Already good Vietnamese?
    if "Lưu" in s or "Tướng" in s or "Thành" in s:
        return s
    for enc in ("latin-1", "cp1252"):
        try:
            fixed = s.encode(enc).decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
        # Prefer candidate that looks more Vietnamese / less mojibake
        if fixed != s and ("ư" in fixed or "ơ" in fixed or "ạ" in fixed or "ế" in fixed or "ộ" in fixed or "ả" in fixed or "ệ" in fixed or "ố" in fixed or "ề" in fixed or "ồ" in fixed or "ệ" in fixed):
            return fixed
        if fixed != s and any(ch in fixed for ch in "ăâêôơưđĂÂÊÔƠƯĐ"):
            # avoid if still has classic mojibake markers
            if not any(m in fixed for m in ("Æ", "Ä‘", "á»", "áº", "Ã")):
                return fixed
            return fixed
    return s


def walk_fix(obj):
    if isinstance(obj, dict):
        return {k: walk_fix(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [walk_fix(v) for v in obj]
    if isinstance(obj, str):
        return fix_mojibake(obj)
    return obj


def build_generals():
    lst = []
    for line in ROWS.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        p = line.split("|")
        tags = [t.strip() for t in p[10].split(",") if t.strip()] if p[10] else []
        obj = {
            "id": p[0],
            "name": p[1],
            "faction": p[2],
            "quality": p[3],
            "troop": p[4],
            "base": {
                "tongLinh": int(p[5]),
                "vuLuc": int(p[6]),
                "triLuc": int(p[7]),
                "hp": int(p[8]),
            },
            "skillId": p[9],
            "tags": tags,
            "obtain": p[11],
        }
        if p[12] == "1":
            obj["npcOnly"] = True
        lst.append(obj)

    doc = {
        "schemaVersion": 2,
        "schema": {
            "id": "stable key",
            "name": "Tên Việt",
            "faction": "factions.list.*",
            "quality": "qualities.tiers.*",
            "troop": "troops.types.*",
            "base": "tongLinh, vuLuc, triLuc, hp @ level 1",
            "skillId": "skills.skills.*",
            "tags": "string[]",
            "obtain": "starter|recruit|campaign|event",
            "npcOnly": "optional bool",
        },
        "startersByFaction": {
            "shu": ["liubei", "guanyu", "zhangfei"],
            "wei": ["caocao", "xuchu", "dianwei"],
            "wu": ["sunquan", "zhouyu", "huanggai"],
        },
        "list": lst,
    }
    out = ROOT / "data" / "generals.json"
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", out, "count", len(lst), "sample", lst[0]["name"], lst[2]["name"], lst[5]["name"])
    return {g["id"]: g["name"] for g in lst}


def fix_recruit(name_by_id: dict[str, str]):
    path = ROOT / "data" / "recruit.json"
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    data = walk_fix(data)
    # Prefer authoritative names from generals
    for item in data.get("list", []):
        hid = item.get("hero_id")
        if hid in name_by_id:
            item["name"] = name_by_id[hid]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", path, "sample", data["list"][0]["name"], data["list"][1]["name"])


def rebuild_bundle():
    files = [
        ("_meta", "meta"),
        ("qualities", "qualities"),
        ("troops", "troops"),
        ("formation", "formation"),
        ("formations", "formations"),
        ("formulas", "formulas"),
        ("factions", "factions"),
        ("skills", "skills"),
        ("generals", "generals"),
        ("recruit", "recruit"),
        ("items", "items"),
        ("buildings", "buildings"),
        ("campaign", "campaign"),
        ("arena", "arena"),
        ("progression", "progression"),
    ]
    parts = []
    for fname, key in files:
        text = (ROOT / "data" / f"{fname}.json").read_text(encoding="utf-8")
        # strip BOM if any
        if text.startswith("\ufeff"):
            text = text[1:]
        parts.append(f'"{key}": {text.rstrip()}')
    header = (
        "// Auto-generated offline DB bundle v2\n"
        "// Source: /data/*.json\n"
        "// Rebuild: py -3 tests/out/_fix_vi_data.py\n"
    )
    body = "(function(g){g.NL_DB={" + ",\n".join(parts) + "};})(window);\n"
    out = ROOT / "js" / "db" / "nl-db.bundle.js"
    out.write_text(header + body, encoding="utf-8")
    # sanity
    sample = out.read_text(encoding="utf-8")
    assert "Lưu Bị" in sample, "bundle missing Lưu Bị"
    assert "LÆ°u" not in sample, "bundle still has mojibake"
    print("wrote", out, "has Lưu Bị:", "Lưu Bị" in sample)


def fix_other_json():
    for rel in ("skills.json", "items.json", "campaign.json", "arena.json", "buildings.json"):
        path = ROOT / "data" / rel
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        fixed = walk_fix(data)
        path.write_text(json.dumps(fixed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("normalized", rel)


if __name__ == "__main__":
    names = build_generals()
    fix_recruit(names)
    fix_other_json()
    rebuild_bundle()
    # verify
    g = json.loads((ROOT / "data" / "generals.json").read_text(encoding="utf-8"))
    print("VERIFY", [x["name"] for x in g["list"][:8]])
