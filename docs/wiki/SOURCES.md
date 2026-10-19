# Wiki sources — Ngọa Long VNG

Fan remake chỉ **học data / tên / mô tả**. Không scrape asset client game.

| Chủ đề | URL | File data | Docs |
|--------|-----|-----------|------|
| Hub | https://ngoalong.vnggames.com/ngoa-long-wiki | — | — |
| Hiệu ứng | https://ngoalong.vnggames.com/ngoa-long-wiki/hieu-ung | `data/status-effects.json`, `data/wiki-effects.json` | `docs/wiki/HIEU-UNG.md` |
| Hiệu ứng (tin tức bảng) | https://ngoalong.vnggames.com/tin-tuc/tin-tuc/hieu-ung-chien-dau.html |cùng HIEU-UNG | cùng HIEU-UNG |
| Binh chủng | https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung | `data/troops-wiki.json` | `docs/wiki/BINH-CHUNG.md` |
| Võ tướng (full JSON) | CDN `…/data/hero/{id}.json` + wiki vo-tuong | `_dl/wiki-heroes/` · `data/wiki/heroes-index.json` | `docs/wiki/VO-TUONG.md` |

## Võ tướng — tải lại + import chiêu

```bash
python3 scripts/fetch-wiki-heroes.py
python3 scripts/import-wiki-hero-skills.py   # skill catalog + match local
python3 scripts/sync-wiki-generals.py        # thêm tướng wiki còn thiếu (npcOnly)
python3 scripts/rebuild-bundle-utf8.py
```

Gồm **toàn bộ** tướng wiki (Ngụy/Thục/Ngô/Quần/Trung lập — playable + NPC). Full body trong `_dl/` (gitignore); index nhẹ trong `data/wiki/`.
Chiêu theo phẩm → `skillsByQuality` · motif trong `fx.motif` · báo cáo `docs/wiki/VO-TUONG-SKILLS.md`.

## Rebuild backend

```bash
py -3 scripts/import-wiki-effects.py
py -3 scripts/rebuild-bundle-utf8.py
```

`statusEffects` nằm trong `js/db/nl-db.bundle.js` → `NL_DB.statusEffects`.
