# -*- coding: utf-8 -*-
"""
Tải HẾT icon binh chủng từ wiki (CDN URLs trong troops-wiki.json)
→ gen sheet đánh thường 8×2 cho từng unit
→ cập nhật assets/units/sheets/index.json (+ byWikiId / byTroopTier)

Chạy: py -3 scripts/build-all-wiki-troop-assets.py
"""
from __future__ import annotations

import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
WIKI_JSON = ROOT / "data" / "troops-wiki.json"
ICON_DIR = ROOT / "assets" / "units" / "wiki"
BATTLE = ROOT / "assets" / "units" / "battle"
SHEETS = ROOT / "assets" / "units" / "sheets"
UNIT_SHEETS = SHEETS / "units"
ICON_DIR.mkdir(parents=True, exist_ok=True)
UNIT_SHEETS.mkdir(parents=True, exist_ok=True)
BATTLE.mkdir(parents=True, exist_ok=True)

UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    "Referer": "https://ngoalong.vnggames.com/",
}
COLS, ROWS, CELL = 8, 2, 128
TYPES = ("infantry", "spear", "cavalry", "archer", "strategist")
WORKERS = 8


def log(*args: object) -> None:
    print(*args, flush=True)


def fetch(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size >= 800:
        return True
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=45) as r:
            dest.write_bytes(r.read())
        return dest.stat().st_size >= 800
    except Exception as e:
        log("FAIL", dest.name, e)
        return False


def scrub_bg(im: Image.Image) -> Image.Image:
    """Chỉ gỡ nền đen/trắng thuần — giữ giáp tối, bóng, FX."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            if r < 6 and g < 6 and b < 6:
                px[x, y] = (0, 0, 0, 0)
            elif r > 252 and g > 252 and b > 252:
                px[x, y] = (0, 0, 0, 0)
    return im


def fit_icon(im: Image.Image, size: int = CELL) -> Image.Image:
    """
    Fit full icon vào ô — margin đều, không crop chặt (giữ tóc/sét/áo).
    Chừa mép ~10% mỗi cạnh.
    """
    im = scrub_bg(im)
    w, h = im.size
    box = im.getbbox() or (0, 0, w, h)
    # Nới bbox 2px giữ fringe FX
    x0 = max(0, box[0] - 2)
    y0 = max(0, box[1] - 2)
    x1 = min(w, box[2] + 2)
    y1 = min(h, box[3] + 2)
    im = im.crop((x0, y0, x1, y1))

    margin = max(8, size // 10)
    max_w = size - 2 * margin
    max_h = size - 2 * margin
    im.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - im.width) // 2
    # Chân gần đáy nhưng luôn đủ mép trên cho mũ/sét
    oy = size - margin - im.height
    if oy < margin:
        oy = margin
    canvas.paste(im, (ox, oy), im)
    return canvas


def shift(im: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (dx, dy), im)
    return out


def scale_about_feet(im: Image.Image, sx: float, sy: float) -> Image.Image:
    """Scale nhẹ trong ô — không phình quá mạnh (tránh cắt FX)."""
    w, h = im.size
    sx = max(0.9, min(1.1, sx))
    sy = max(0.9, min(1.1, sy))
    nw, nh = max(1, int(w * sx)), max(1, int(h * sy))
    scaled = im.resize((nw, nh), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox = (w - nw) // 2
    oy = h - nh
    if oy < 0:
        oy = 0
        scaled = scaled.crop((0, nh - h, nw, nh)) if nh > h else scaled
        nh = min(nh, h)
    out.paste(scaled, (ox, oy), scaled)
    return out


def rotate_about_feet(im: Image.Image, deg: float) -> Image.Image:
    """Xoay nhẹ — giữ full canvas, không getbbox (tránh cắt sét/áo)."""
    w, h = im.size
    deg = max(-10, min(10, deg))
    pad = Image.new("RGBA", (w + 48, h + 48), (0, 0, 0, 0))
    pad.paste(im, (24, 24), im)
    rot = pad.rotate(deg, resample=Image.Resampling.BICUBIC, expand=False)
    cx, cy = rot.size[0] // 2, rot.size[1] // 2
    return rot.crop((cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2))


def tint(im: Image.Image, rgb: tuple[int, int, int], strength: float) -> Image.Image:
    overlay = Image.new("RGBA", im.size, (*rgb, int(255 * strength)))
    base = im.copy()
    _, _, _, a = base.split()
    over = Image.blend(base, Image.composite(overlay, base, a), strength)
    over.putalpha(a)
    return over


def brighten(im: Image.Image, factor: float) -> Image.Image:
    rgb = im.convert("RGB")
    enh = ImageEnhance.Brightness(rgb).enhance(factor)
    out = enh.convert("RGBA")
    out.putalpha(im.split()[-1])
    return out


def make_sheet(icon_path: Path, out_path: Path) -> None:
    base = fit_icon(Image.open(icon_path), CELL)
    # Attack nhẹ — ít dịch/xoay để không cắt tóc/sét/áo
    frames: list[Image.Image] = [
        base,
        rotate_about_feet(scale_about_feet(shift(base, 3, 0), 0.98, 1.02), -5),
        rotate_about_feet(scale_about_feet(shift(base, 5, 0), 0.97, 1.03), -7),
        rotate_about_feet(scale_about_feet(shift(base, -8, -2), 1.06, 0.96), 6),
        brighten(rotate_about_feet(scale_about_feet(shift(base, -10, -2), 1.08, 0.95), 8), 1.15),
        tint(scale_about_feet(shift(base, -6, 0), 1.04, 0.98), (255, 220, 120), 0.28),
        scale_about_feet(shift(base, -3, 0), 1.01, 0.99),
        base,
        # Idle tĩnh ×8 — không bob trong sheet (tránh rung khi idle 1 frame)
        base,
        base,
        base,
        base,
        tint(base, (180, 210, 255), 0.18),
        tint(scale_about_feet(base, 1.04, 1.04), (255, 210, 100), 0.25),
        brighten(tint(scale_about_feet(base, 1.06, 1.05), (255, 240, 160), 0.32), 1.1),
        tint(base, (200, 230, 255), 0.1),
    ]
    sheet = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, ((i % COLS) * CELL, (i // COLS) * CELL), fr)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, "PNG")


def wiki_cap_to_tier(cap: int) -> int:
    if cap <= 1:
        return 1
    if cap >= 6:
        return 6
    return cap


def load_player_units() -> list[dict]:
    payload = json.loads(WIKI_JSON.read_text(encoding="utf-8"))
    out = []
    for u in payload.get("allUnits") or []:
        if u.get("npc") or u.get("boat"):
            continue
        troop = u.get("troop")
        if troop not in TYPES:
            continue
        url = u.get("iconUrl")
        if not url:
            continue
        wid = str(u.get("wikiId") or u.get("id") or "")
        if not wid:
            continue
        tier = int(u.get("tier") or wiki_cap_to_tier(int(u.get("wikiCap") or 0)))
        tier = max(1, min(6, tier))
        out.append(
            {
                "wikiId": wid,
                "name": u.get("name") or wid,
                "troop": troop,
                "tier": tier,
                "wikiCap": int(u.get("wikiCap") or 0),
                "iconUrl": url,
            }
        )
    return out


def pick_rep(units: list[dict], troop: str, tier: int) -> dict | None:
    """Ưu tiên tên ngắn / base cho từng loại×bậc."""
    prefs = {
        "infantry": ["bộ", "thuẫn", "giáp bộ", "kim bộ"],
        "spear": ["thương", "kích", "kim thương"],
        "cavalry": ["kỵ", "bạch kỵ", "hổ báo"],
        "archer": ["cung", "nỏ", "hỏa cung"],
        "strategist": ["quan văn", "sách sĩ", "mưu"],
    }
    pool = [u for u in units if u["troop"] == troop and u["tier"] == tier]
    if not pool:
        pool = [u for u in units if u["troop"] == troop]
    if not pool:
        return None
    for p in prefs.get(troop, []):
        for u in pool:
            if p in (u["name"] or "").lower():
                return u
    return sorted(pool, key=lambda x: len(x["name"]))[0]


def main() -> int:
    units = load_player_units()
    # unique by wikiId (keep first)
    by_id: dict[str, dict] = {}
    for u in units:
        by_id.setdefault(u["wikiId"], u)
    units = list(by_id.values())
    log("player units with icons:", len(units))

    # --- download ---
    jobs = []
    for u in units:
        dest = ICON_DIR / f"{u['wikiId']}.png"
        jobs.append((u, dest))

    ok_dl = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(fetch, u["iconUrl"], dest): (u, dest) for u, dest in jobs}
        for fut in as_completed(futs):
            u, dest = futs[fut]
            if fut.result():
                ok_dl += 1
                u["iconPath"] = dest
            else:
                u["iconPath"] = None
    log("downloaded/ok icons:", ok_dl)

    manifest = [
        {
            "wikiId": u["wikiId"],
            "name": u["name"],
            "troop": u["troop"],
            "tier": u["tier"],
            "wikiCap": u["wikiCap"],
            "file": f"{u['wikiId']}.png",
            "url": u["iconUrl"],
        }
        for u in units
        if u.get("iconPath")
    ]
    (ICON_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # --- sheets per unit ---
    by_wiki: dict[str, dict] = {}
    by_troop_tier: dict[str, dict[str, list[str]]] = {t: {str(i): [] for i in range(1, 7)} for t in TYPES}
    done = 0
    for u in units:
        if not u.get("iconPath"):
            continue
        wid = u["wikiId"]
        sheet_rel = f"assets/units/sheets/units/{wid}.png"
        icon_rel = f"assets/units/wiki/{wid}.png"
        out = UNIT_SHEETS / f"{wid}.png"
        try:
            make_sheet(u["iconPath"], out)
            done += 1
            if done % 25 == 0:
                log("sheets", done, "/", ok_dl)
        except Exception as e:
            log("sheet fail", wid, e)
            continue
        meta = {
            "sheet": sheet_rel,
            "cols": COLS,
            "rows": ROWS,
            "kind": "wiki-unit",
            "icon": icon_rel,
            "name": u["name"],
            "troop": u["troop"],
            "tier": u["tier"],
        }
        by_wiki[wid] = meta
        by_troop_tier[u["troop"]][str(u["tier"])].append(wid)

    log("unit sheets:", done)

    # --- type × tier reps (battle aliases) ---
    type_index: dict[str, dict] = {}
    tier_map: dict[str, dict] = {}
    for troop in TYPES:
        type_index[troop] = {}
        tier_map[troop] = {}
        for tier in range(1, 7):
            rep = pick_rep([u for u in units if u.get("iconPath")], troop, tier)
            if not rep:
                continue
            wid = rep["wikiId"]
            battle_icon = BATTLE / f"wiki-{troop}-t{tier}.png"
            battle_icon.write_bytes(rep["iconPath"].read_bytes())
            sheet_out = SHEETS / f"{troop}-t{tier}.png"
            # cavalry t5–6: giữ hobao nếu có, vẫn copy icon wiki
            if troop == "cavalry" and tier >= 5 and (SHEETS / "hobao-ky.png").exists():
                type_index[troop][str(tier)] = {
                    "sheet": "assets/units/sheets/hobao-ky.png",
                    "cols": 8,
                    "rows": 2,
                    "kind": "hobao",
                    "icon": f"assets/units/battle/wiki-{troop}-t{tier}.png",
                    "wikiId": wid,
                }
            else:
                make_sheet(rep["iconPath"], sheet_out)
                type_index[troop][str(tier)] = {
                    "sheet": f"assets/units/sheets/{troop}-t{tier}.png",
                    "cols": COLS,
                    "rows": ROWS,
                    "kind": "wiki-derived",
                    "icon": f"assets/units/battle/wiki-{troop}-t{tier}.png",
                    "wikiId": wid,
                }
            if tier == 1:
                (BATTLE / f"wiki-{troop}.png").write_bytes(rep["iconPath"].read_bytes())
            tier_map[troop][str(tier)] = {
                "file": f"assets/units/battle/wiki-{troop}-t{tier}.png",
                "wikiName": rep["name"],
                "wikiCap": rep["wikiCap"],
                "wikiId": wid,
                "source": rep["iconUrl"],
            }
            log(f"rep {troop} t{tier}: {rep['name']}")

    index = {
        "schemaVersion": 2,
        "note": "types = đại diện loại×bậc; byWikiId = từng binh chủng wiki; byTroopTier = pool skin theo bậc",
        "types": type_index,
        "byWikiId": by_wiki,
        "byTroopTier": by_troop_tier,
    }
    # backward compat: top-level troop keys still work for old loaders
    for troop, tiers in type_index.items():
        index[troop] = tiers

    (SHEETS / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    (BATTLE / "tier-map.json").write_text(json.dumps(tier_map, ensure_ascii=False, indent=2), encoding="utf-8")
    (ICON_DIR / "tier-map.json").write_text(json.dumps(tier_map, ensure_ascii=False, indent=2), encoding="utf-8")
    log("wrote index.json units", len(by_wiki), "types", {k: list(v.keys()) for k, v in type_index.items()})
    return 0


if __name__ == "__main__":
    sys.exit(main())
