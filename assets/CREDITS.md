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
- **Cethiel Weapon Slash** (OGA, CC0) → `assets/fx/slash/` (classic/blue/purple/fire)
- **Qi spirit packs** (style Hỏa Long) — **original / AI-assisted for fan remake**  
  → `assets/fx/skill/{rong,xa,ho,soi,thuy,loi,phong,bagua,hon}/qi_*`  
  Mỗi pack: `charge_*` · `flight_*` · `impact_*`. Gen: `scripts/gen-qi-spirit-packs.py`.
- **Whirlwind** by n4 — CC0 → `assets/fx/whirlwind/` (kỵ xung)
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

## itch.io VFX drops
- **Brackeys' VFX Bundle** — https://brackeys.itch.io/brackeys-vfx-bundle  
  → slice runtime `assets/fx/itch/brackeys/{pack}/` (atlases thô đã xóa)
- **Stylized Projectiles** — https://laplahce.itch.io/stylized-projectiles-pack  
  → `assets/fx/itch/stylized/{slash_a,lightning,flash,…}/`
- **Binbun Free** — Godot shader-only → không dùng.
- **Superpowers** (Sparklin, GitHub CC0) → curated `assets/fx/itch/superpowers/`

## CodeManu + SpritePilot (hồn upgrade)
- **CodeManu Free VFX Pack** — CC0 — https://opengameart.org/content/free-vfx-asset-pack
  → `assets/fx/itch/codemanu/{charged,vortex,dithered_fire,pixel_fire,explosion,explosion2,kabooms,anima,constellation,puff_stars,electric_shield,tentacles,worm,elden_ring,impact,big_hit,wheel}/`
- **SpritePilot Free Effects** — CC0 — https://spritepilot.com/free-game-assets/effects
  → `assets/fx/itch/spritepilot/{explosion , smoke_puff , landing_dust , hit_spark , fire , water_splash , magic_sparkle}/`

