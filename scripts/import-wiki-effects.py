# -*- coding: utf-8 -*-
"""
Import hiệu ứng chiến đấu từ wiki Ngọa Long VNG → data + docs.

Nguồn ưu tiên:
1. _dl/wiki-hieu-ung/hieu-ung-chien-dau.html (HTML tin tức — bảng đầy đủ)
2. Markdown dump (agent-tools / docs cache) nếu có
3. Fallback: parse từ nội dung đã lưu trong docs/wiki/

Xuất:
- data/status-effects.json  (engine map + wikiCatalog)
- data/wiki-effects.json     (catalog thuần wiki, snapshot)
- docs/wiki/HIEU-UNG.md
- docs/wiki/SOURCES.md
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DL = ROOT / "_dl" / "wiki-hieu-ung"
DOCS = ROOT / "docs" / "wiki"
DATA = ROOT / "data"
AGENT_NEWS = Path(
    "/Users/it/.cursor/projects/Users-it-Documents-3Q/agent-tools/"
    "24673838-5eae-4170-a7a3-c6f56a0ed804.txt"
)
AGENT_HIEU = Path(
    "/Users/it/.cursor/projects/Users-it-Documents-3Q/agent-tools/"
)

DOCS.mkdir(parents=True, exist_ok=True)
DATA.mkdir(parents=True, exist_ok=True)

SOURCE_WIKI = "https://ngoalong.vnggames.com/ngoa-long-wiki/hieu-ung"
SOURCE_NEWS = "https://ngoalong.vnggames.com/tin-tuc/tin-tuc/hieu-ung-chien-dau.html"

# Engine type → wiki name (giữ ổn định cho combat-engine)
ENGINE_MAP = {
    "stun": {
        "wiki": "Hỗn loạn",
        "label": "Hỗn loạn",
        "short": "Loạn",
        "kind": "control",
        "desc": "Một lượt không thể hành động.",
    },
    "silence": {
        "wiki": "Ám tế",
        "label": "Ám tế",
        "short": "Ám",
        "kind": "debuff",
        "desc": "Không thể hồi phục sĩ khí.",
    },
    "poison": {
        "wiki": "Trúng độc",
        "label": "Trúng độc",
        "short": "Độc",
        "kind": "debuff",
        "desc": "Mỗi lượt mất một phần binh lực.",
    },
    "burn": {
        "wiki": "Thiêu đốt",
        "label": "Thiêu đốt",
        "short": "Thiêu",
        "kind": "debuff",
        "desc": "Mỗi lượt bị thiêu đốt lính.",
    },
    "atk_up": {
        "wiki": "Anh dũng",
        "label": "Anh dũng",
        "short": "Dũng",
        "kind": "buff",
        "desc": "Tất cả tấn công tăng, có thể cộng dồn.",
    },
    "atk_down": {
        "wiki": "Giảm tấn công",
        "label": "Giảm công",
        "short": "Yếu",
        "kind": "debuff",
        "desc": "Giảm tất cả lực tấn công.",
    },
    "def_up": {
        "wiki": "Kiên thủ",
        "label": "Kiên thủ",
        "short": "Thủ",
        "kind": "buff",
        "desc": "Tất cả phòng thủ tăng, có thể cộng dồn.",
    },
    "def_down": {
        "wiki": "Hạ thấp phòng thủ",
        "label": "Phá thủ",
        "short": "Phá",
        "kind": "debuff",
        "desc": "Giảm tất cả phòng thủ.",
    },
    "heal_pct": {
        "wiki": "Hồi phục",
        "label": "Hồi phục",
        "short": "Hồi",
        "kind": "buff",
        "desc": "Hồi binh lực.",
    },
    "morale_boost": {
        "wiki": "Phấn Chấn",
        "label": "Phấn chấn",
        "short": "Khí",
        "kind": "buff",
        "desc": "Tăng sĩ khí mỗi lượt.",
    },
}


def slugify(name: str) -> str:
    s = name.strip().lower()
    # Vietnamese-ish fold for stable ids
    repl = {
        "à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a",
        "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
        "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a",
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
    out = []
    for ch in s:
        out.append(repl.get(ch, ch))
    s = "".join(out)
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_") or "unknown"


def kind_from_category(cat: str) -> str:
    c = (cat or "").strip().lower()
    if "khống chế" in c or "control" in c:
        return "control"
    if "không thể giải trừ" in c:
        return "unremovable"
    if "giảm" in c or "bất lợi" in c:
        return "debuff"
    if "tăng" in c or "có lợi" in c:
        return "buff"
    if "không có hiệu ứng" in c:
        return "marker"
    if "trung lập" in c:
        return "neutral"
    return "other"


def parse_markdown_table(text: str) -> list[dict]:
    """Parse | Biểu tượng | Tên | Thể loại | Chú thích | rows."""
    rows: list[dict] = []
    pending_name = None
    pending_cat = None
    pending_desc_parts: list[str] = []

    def flush():
        nonlocal pending_name, pending_cat, pending_desc_parts
        if not pending_name:
            return
        desc = " ".join(p.strip() for p in pending_desc_parts if p.strip()).strip()
        rows.append(
            {
                "id": slugify(pending_name),
                "name": pending_name.strip(),
                "category": (pending_cat or "").strip(),
                "kind": kind_from_category(pending_cat or ""),
                "desc": desc,
                "source": "news",
            }
        )
        pending_name = None
        pending_cat = None
        pending_desc_parts = []

    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        # skip header / separator
        if "Biểu tượng" in line or re.match(r"^\|\s*---", line):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 3:
            continue
        # cells: icon, name, category, desc  OR continuation with empty name
        icon, name, cat = cells[0], cells[1], cells[2]
        desc = cells[3] if len(cells) > 3 else ""
        if name:
            flush()
            pending_name = name
            pending_cat = cat
            pending_desc_parts = [desc] if desc else []
        elif pending_name and desc:
            pending_desc_parts.append(desc)
    flush()
    return rows


def parse_wiki_hieu_ung_md(text: str) -> list[dict]:
    """Heuristic parse for wiki hub listing (name + Có lợi/Bất lợi + desc)."""
    rows: list[dict] = []
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    # Filter noise
    skip_prefix = ("Địa chỉ", "Điện thoại", "Page image", "Tướng ở trạng thái")
    i = 0
    while i < len(lines):
        ln = lines[i]
        if any(ln.startswith(p) for p in skip_prefix):
            i += 1
            continue
        # Pattern: "Anh Dũng Có lợi" or "Ám Vân Bất lợi" or "Anh Dũng 2 Trung Lập Không thể giải trừ"
        m = re.match(
            r"^(.+?)\s+(Có lợi|Bất lợi|Trung Lập(?:\s+Không thể giải trừ)?|Không thể giải trừ|Khống chế)$",
            ln,
        )
        if m:
            name = m.group(1).strip()
            cat = m.group(2).strip()
            desc = ""
            if i + 1 < len(lines) and not re.match(
                r"^.+\s+(Có lợi|Bất lợi|Trung Lập)", lines[i + 1]
            ):
                # next line may be desc unless it's another title-like
                nxt = lines[i + 1]
                if not nxt.startswith("http") and len(nxt) > 8:
                    desc = nxt
                    i += 1
            rows.append(
                {
                    "id": slugify(name),
                    "name": name,
                    "category": cat,
                    "kind": kind_from_category(cat),
                    "desc": desc,
                    "source": "wiki",
                }
            )
        i += 1
    return rows


def dedupe_merge(primary: list[dict], secondary: list[dict]) -> list[dict]:
    by_id: dict[str, dict] = {}
    for r in primary + secondary:
        rid = r["id"]
        if rid not in by_id:
            by_id[rid] = dict(r)
        else:
            # prefer longer desc / keep both sources
            cur = by_id[rid]
            if len(r.get("desc") or "") > len(cur.get("desc") or ""):
                cur["desc"] = r["desc"]
            if r.get("category") and not cur.get("category"):
                cur["category"] = r["category"]
            src = set(filter(None, [cur.get("source"), r.get("source")]))
            cur["source"] = "+".join(sorted(src))
    # stable sort by name
    return sorted(by_id.values(), key=lambda x: x["name"].lower())


LOAI_LABEL = {
    "bat-loi": "Bất lợi",
    "bat-loi khong-che": "Bất lợi · Khống chế",
    "co-loi": "Có lợi",
    "trung-lap": "Trung lập",
    "trung-lap khong-che": "Trung lập · Không thể giải trừ",
}


def parse_wiki_html(html: str) -> list[dict]:
    """Parse cards: button[data-nlw-buff] + data-nlw-ten + data-nlw-loai + desc."""
    rows: list[dict] = []
    for m in re.finditer(
        r'<button[^>]*data-nlw-buff="(\d+)"[^>]*data-nlw-loai="([^"]+)"[^>]*>(.*?)</button>',
        html,
        re.S | re.I,
    ):
        buff_id, loai, body = m.group(1), m.group(2), m.group(3)
        nm = re.search(r'data-nlw-ten[^>]*>([^<]+)<', body)
        if not nm:
            continue
        name = nm.group(1).strip()
        # badge text if present
        badge = re.search(
            r'round[^>]*>\s*(Có lợi|Bất lợi|Trung lập|Khống chế|Không thể giải trừ)[^<]*<',
            body,
        )
        cat = badge.group(1).strip() if badge else LOAI_LABEL.get(loai, loai)
        # first descriptive <p>
        desc = ""
        for pm in re.finditer(r'<p[^>]*>(.*?)</p>', body, re.S):
            raw = re.sub(r"<[^>]+>", "", pm.group(1)).strip()
            if not raw:
                continue
            if re.match(r"^\d+\s*tướng", raw, re.I):
                continue
            desc = raw
            break
        icon = None
        im = re.search(r'<img[^>]+src="([^"]+)"', body)
        if im:
            icon = im.group(1)
        rows.append(
            {
                "id": slugify(name),
                "wikiBuffId": int(buff_id),
                "name": name,
                "category": cat,
                "loai": loai,
                "kind": kind_from_category(cat + " " + loai.replace("-", " ")),
                "desc": desc,
                "icon": icon,
                "source": "wiki-html",
            }
        )
    return rows


def load_text_sources() -> tuple[str, str, list[dict]]:
    news_md = ""
    md_path = DL / "hieu-ung-chien-dau.md"
    if md_path.exists():
        news_md = md_path.read_text(encoding="utf-8", errors="ignore")
    elif AGENT_NEWS.exists():
        news_md = AGENT_NEWS.read_text(encoding="utf-8", errors="ignore")

    html_rows: list[dict] = []
    html_wiki = DL / "hieu-ung.html"
    if html_wiki.exists() and html_wiki.stat().st_size > 1000:
        html_rows = parse_wiki_html(html_wiki.read_text(encoding="utf-8", errors="ignore"))

    return news_md, "", html_rows


def build_engine_effects(catalog: list[dict]) -> dict:
    effects = {}
    by_name = {e["name"].lower(): e for e in catalog}
    for eid, meta in ENGINE_MAP.items():
        wiki_hit = by_name.get(meta["wiki"].lower()) or by_name.get(meta["label"].lower())
        desc = meta["desc"]
        if wiki_hit and wiki_hit.get("desc"):
            desc = wiki_hit["desc"]
        effects[eid] = {
            "id": eid,
            "wiki": meta["wiki"],
            "label": meta["label"],
            "short": meta["short"],
            "kind": meta["kind"],
            "desc": desc,
            "wikiId": slugify(meta["wiki"]),
        }
    return effects


def write_docs(catalog: list[dict]) -> None:
    lines = [
        "# Hiệu ứng chiến đấu — Ngọa Long Wiki (snapshot)",
        "",
        f"> Nguồn: [{SOURCE_NEWS}]({SOURCE_NEWS}) · [{SOURCE_WIKI}]({SOURCE_WIKI})",
        f"> Import: `scripts/import-wiki-effects.py` · Tổng **{len(catalog)}** hiệu ứng.",
        "",
        "| Tên | Thể loại | Kind | Mô tả |",
        "| --- | --- | --- | --- |",
    ]
    for e in catalog:
        desc = (e.get("desc") or "").replace("|", "\\|").replace("\n", " ")
        if len(desc) > 160:
            desc = desc[:157] + "…"
        lines.append(
            f"| {e['name']} | {e.get('category') or '—'} | {e.get('kind') or '—'} | {desc} |"
        )
    lines.append("")
    (DOCS / "HIEU-UNG.md").write_text("\n".join(lines), encoding="utf-8")

    sources = f"""# Wiki sources — Ngọa Long VNG

Fan remake chỉ **học data / tên / mô tả**. Không scrape asset client game.

| Chủ đề | URL | File data | Docs |
|--------|-----|-----------|------|
| Hub | https://ngoalong.vnggames.com/ngoa-long-wiki | — | — |
| Hiệu ứng | {SOURCE_WIKI} | `data/status-effects.json`, `data/wiki-effects.json` | `docs/wiki/HIEU-UNG.md` |
| Hiệu ứng (tin tức bảng) | {SOURCE_NEWS} |同上 | 同上 |
| Binh chủng | https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung | `data/troops-wiki.json` | `docs/wiki/BINH-CHUNG.md` |

## Rebuild backend

```bash
py -3 scripts/import-wiki-effects.py
py -3 scripts/rebuild-bundle-utf8.py
```

`statusEffects` nằm trong `js/db/nl-db.bundle.js` → `NL_DB.statusEffects`.
"""
    sources = sources.replace("同上", "cùng HIEU-UNG")
    (DOCS / "SOURCES.md").write_text(sources, encoding="utf-8")


def summarize_troops_doc() -> None:
    tw = DATA / "troops-wiki.json"
    if not tw.exists():
        return
    data = json.loads(tw.read_text(encoding="utf-8"))
    players = data.get("playerUnits") or data.get("units") or []
    npcs = data.get("npcUnits") or []
    lines = [
        "# Binh chủng — Ngọa Long Wiki (snapshot)",
        "",
        f"> Nguồn: {data.get('source') or 'https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung'}",
        f"> File data: `data/troops-wiki.json` (schema v{data.get('schemaVersion', '?')})",
        "",
        f"- Player units: **{len(players)}**",
        f"- NPC units: **{len(npcs)}**",
        "",
        "## Tier names (theo loại)",
        "",
    ]
    for typ, names in (data.get("tierNames") or {}).items():
        lines.append(f"- **{typ}**: " + " → ".join(names))
    lines.append("")
    lines.append("## Player units (rút gọn)")
    lines.append("")
    lines.append("| Tên | Loại | Cấp wiki | Tier | Tags |")
    lines.append("| --- | --- | --- | --- | --- |")
    for u in players[:200]:
        tags = ", ".join(u.get("tags") or [])[:40]
        lines.append(
            f"| {u.get('name','')} | {u.get('type','')} | {u.get('wikiCap', u.get('cap',''))} | {u.get('tier','')} | {tags} |"
        )
    if len(players) > 200:
        lines.append(f"| … | | | | (+{len(players)-200} nữa trong JSON) |")
    lines.append("")
    (DOCS / "BINH-CHUNG.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    news_text, wiki_text, html_rows = load_text_sources()
    from_news = parse_markdown_table(news_text) if news_text else []
    from_wiki_md = parse_wiki_hieu_ung_md(wiki_text) if wiki_text else []
    # Ưu tiên HTML wiki (đủ ~320) rồi bổ sung mô tả từ tin tức
    catalog = dedupe_merge(html_rows, dedupe_merge(from_news, from_wiki_md))
    if not catalog:
        print("ERROR: no effects parsed — need HTML in _dl/wiki-hieu-ung/hieu-ung.html", file=sys.stderr)
        return 1

    engine = build_engine_effects(catalog)
    status = {
        "schemaVersion": 2,
        "source": SOURCE_WIKI,
        "sourceNews": SOURCE_NEWS,
        "importedAt": __import__("datetime").datetime.now().strftime("%Y-%m-%d"),
        "note": "effects = map engine combat; wikiCatalog = snapshot tên wiki (fan remake).",
        "effects": engine,
        "wikiCatalog": catalog,
        "stats": {
            "engineCount": len(engine),
            "wikiCount": len(catalog),
            "fromNews": len(from_news),
            "fromWikiHtml": len(html_rows),
            "fromWikiMd": len(from_wiki_md),
        },
    }
    (DATA / "status-effects.json").write_text(
        json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    wiki_only = {
        "schemaVersion": 1,
        "source": SOURCE_WIKI,
        "sourceNews": SOURCE_NEWS,
        "count": len(catalog),
        "effects": catalog,
    }
    (DATA / "wiki-effects.json").write_text(
        json.dumps(wiki_only, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    write_docs(catalog)
    summarize_troops_doc()
    print(
        f"OK effects engine={len(engine)} wiki={len(catalog)} "
        f"(html={len(html_rows)} news={len(from_news)} md={len(from_wiki_md)})"
    )
    print(" → data/status-effects.json, data/wiki-effects.json")
    print(" → docs/wiki/HIEU-UNG.md, BINH-CHUNG.md, SOURCES.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
