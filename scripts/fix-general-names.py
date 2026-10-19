# -*- coding: utf-8 -*-
"""
Chuẩn hóa tên tướng Hán-Việt theo:
- Wikipedia tiếng Việt
- Bảng phiên âm dựa bản Phan Kế Bính – Bùi Kỷ (Tam quốc diễn nghĩa)
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# id -> tên chuẩn (chỉ sửa chỗ sai / thống nhất)
BY_ID = {
    "weiyan": "Ngụy Diên",
    "xuhuang": "Từ Hoảng",
    "lubu": "Lã Bố",
    # còn lại đã đúng; giữ tường minh vài tên dễ lệch
    "zhanghe": "Trương Cáp",
    "licadian": "Lý Điển",
    "zhouzhi": "Chu Thái",
    "xiahou_yuan": "Hạ Hầu Uyên",
    "xiahou_dun": "Hạ Hầu Đôn",
    "handang": "Hàn Đương",
    "chengpu": "Trình Phổ",
    "huanggai": "Hoàng Cái",
    "zhangzhao": "Trương Chiêu",
    "zhugejin": "Gia Cát Cẩn",
    "xiaoqiao": "Tiểu Kiều",
    "daqiao": "Đại Kiều",
    "guojia": "Quách Gia",
    "xunyu": "Tuân Úc",
    "xunyou": "Tuân Du",
    "xuchu": "Hứa Chử",
    "dianwei": "Điển Vi",
    "jiaxu": "Giả Hủ",
    "fazheng": "Pháp Chính",
    "xushu": "Từ Thứ",
    "pangtong": "Bàng Thống",
    "liaohua": "Liêu Hóa",
    "guanying": "Quan Bình",
    "zhangbao_shu": "Trương Bào",
    "zhangbao": "Trương Bảo",
    "zhangliang": "Trương Lương",
    "zhangjue": "Trương Giác",
    "huaxiong": "Hoa Hùng",
    "dongzhuo": "Đổng Trác",
    "liru": "Lý Nho",
    "lijue": "Lý Thôi",
    "guosi": "Quách Dĩ",
    "fanchou": "Phàn Trù",
    "zhangji": "Trương Tế",
    "yuanshao": "Viên Thiệu",
    "yuanshu": "Viên Thuật",
    "gongsunzan": "Công Tôn Toản",
    "liubiao": "Lưu Biểu",
    "liuzhang": "Lưu Chương",
    "yanliang": "Nhan Lương",
    "wenchou": "Văn Xú",
    "tianfeng": "Điền Phong",
    "jushou": "Thư Thụ",
    "kongrong": "Khổng Dung",
    "taoqian": "Đào Khiêm",
    "hanxuan": "Hàn Huyền",
}

# thay chuỗi cũ → mới trong mọi JSON (NPC label, campaign title…)
TEXT_REPLACE = [
    ("Nguỵ Diên", "Ngụy Diên"),
    ("Từ Hoàng", "Từ Hoảng"),
    ("Lữ Bố", "Lã Bố"),
]


def walk(obj):
    if isinstance(obj, dict):
        if "id" in obj and "name" in obj and obj["id"] in BY_ID:
            obj["name"] = BY_ID[obj["id"]]
        if "hero_id" in obj and "name" in obj and obj["hero_id"] in BY_ID:
            obj["name"] = BY_ID[obj["hero_id"]]
        if "generalId" in obj and "name" in obj and obj["generalId"] in BY_ID:
            obj["name"] = BY_ID[obj["generalId"]]
        for k, v in list(obj.items()):
            if isinstance(v, str):
                for a, b in TEXT_REPLACE:
                    if a in v:
                        obj[k] = v.replace(a, b)
                        v = obj[k]
            else:
                walk(v)
    elif isinstance(obj, list):
        for x in obj:
            walk(x)


def main() -> None:
    files = [
        "generals.json",
        "recruit.json",
        "campaign.json",
        "progression.json",
        "arena.json",
        "items.json",
        "factions.json",
        "_meta.json",
    ]
    for rel in files:
        path = ROOT / "data" / rel
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        walk(data)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("fixed", rel)

    # rebuild-vi-db ROWS typo
    ps1 = ROOT / "scripts" / "rebuild-vi-db.py"
    if ps1.exists():
        t = ps1.read_text(encoding="utf-8")
        t2 = t
        for a, b in TEXT_REPLACE:
            t2 = t2.replace(a, b)
        t2 = t2.replace("Nguỵ Diên", "Ngụy Diên")
        t2 = t2.replace("|Từ Hoàng|", "|Từ Hoảng|")
        if t2 != t:
            ps1.write_text(t2, encoding="utf-8")
            print("fixed rebuild-vi-db.py")


if __name__ == "__main__":
    main()
