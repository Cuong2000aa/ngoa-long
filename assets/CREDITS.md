# Art credits

## City buildings (Three Kingdoms isometric)
- **Japanese buildings – isometric strategy game mockup** by Jetrel — **CC0**  
  https://opengameart.org/content/japanese-buildings-isometric-strategy-game-mockup  
  → `assets/city/buildings/sprite-*.png`
- **Chinese roof** by mkwong98 — CC0 → `assets/city/buildings/roof-chinese.png`
- **Chinese Palace Pack** (FreeGameSprites) — **CC0**  
  https://freegamesprites.com/en/packs/chinese  
  → `assets/city/buildings/cn/` · `assets/city/cn-palace/`

## Battle units — wiki Ngọa Long VNG (fan remake)
- Icon binh chủng theo CẤP: [Wiki — Binh chủng](https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung)  
  → `assets/units/battle/wiki-{type}-t{1..6}.png`  
  Sheets: `assets/units/sheets/{type}-t{1..6}.png` + `hobao-ky.png` (cavalry tier ≥ 5)  
  Fallback SVG: `assets/units/general-*.svg`  
  Props GLB (optional): `assets/units/props/*.glb`  
  **IP VNG** — fan remake only.

## Combat VFX (CC0) — sprite only
- **Kenney Particle Pack** — CC0 — https://kenney.nl/assets/particle-pack  
  → `assets/fx/particles/` (**PNG Transparent** only)
- **Cethiel** (OGA, CC0): Arcane, Earth, Fire Wrath, Weapon Slash, Blood, Water, Pure  
  → `assets/fx/arcane|earth|fire-wrath|slash|blood|water|pure/`
- **StarsteelGaming Spell Effects** — CC0  
  → `assets/fx/skill/starsteel/`
- **Fire Dragon Roller** by Nineball — CC0  
  → `assets/fx/dragon/` (legacy pixel; Hỏa Long 3D dùng soft spirit)
- **Dragon spirit soft glow** — generated (`scripts/gen-dragon-spirit-fx.mjs`)  
  → `assets/fx/dragon_spirit/` (256px soft silhouettes for hồn rồng 3D)
- **Whirlwind for effects** by n4 — CC0  
  https://opengameart.org/content/whirlwind-for-effects  
  → `assets/fx/whirlwind/`
- **Wolf Game Character** (Attack frames) by Segel2D — CC0  
  https://opengameart.org/content/wolf-game-character  
  → `assets/fx/wolf/` (tint tối cho bóng sói trận)
- **SpritePilot Combat Effects** (claw slash, shockwave, ground slam, critical hit) — CC0  
  https://spritepilot.com/free-game-assets/combat  
  → `assets/fx/tiger/` (Hổ Khiếu / motif tiger: roar + claw + slam)
- **Pixel Ability FX Forge** (GamingToolset) — **Apache-2.0**  
  https://github.com/GamingToolset/pixel-ability-fx-forge  
  Generate: `node scripts/forge-generate-fx.mjs` → `assets/fx/forge/{frost,storm,ember,…}_*/`  
  Used as primary sheets for thunder / water / fire / poison / arcane / shield / buff flashes.

Flash map: `assets/fx/FLASH_MAP.md` · runtime `src/battle/battleVfx.ts`  
Buff/debuff: wiki [Hiệu ứng](https://ngoalong.vnggames.com/ngoa-long-wiki/hieu-ung) → `data/status-effects.json`  
  Icon: `assets/ui/status/*.png` (CDN wiki icons, fan remake) · `scripts/download-status-icons.py`

## Fonts
- **Be Vietnam Pro** — OFL — `assets/fonts/BeVietnamPro-*.ttf`

## UI
- **Kenney** Fantasy UI Borders / UI Pack / Game Icons — CC0 → `assets/ui/`

## Battle backgrounds (Unsplash License)
- Courtyard / palace JPGs → `assets/battle/`

## Hub
- Walls / people / scape / buildings3d GLB — tối ưu từ nguồn CC0 → `assets/city/`

---

*Dọn source 2026-10: xóa `_dl`, `assets-src`, `assets/packs`, wiki scrape thô, portraits/catalog thừa, Light/Elemental/Spell dự trữ không dùng.*
