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
  → `assets/fx/dragon/` — legacy thin outline (không dùng làm emission chính Hỏa Long)
- **Qi spirit packs** (style Hỏa Long) — **original / AI-assisted for fan remake**  
  - `hon_rong/qi_fire` · `qi_azure` · `qi_ivory`  
  - `hon_xa/qi_poison` · `hon_ho/qi_tiger` · `hon_soi/qi_wolf`  
  - `hon_thuy/qi_water` · `hon_loi/qi_thunder` · `hon_phong/qi_wind`  
  Mỗi pack: `charge_*` tụ lực · `flight_*` silhouette bay (đầu phải) · `impact_*` bùm.  
  Pipeline: `scripts/gen-qi-spirit-packs.py` (+ seed AI hổ/sói). **Không** asset client VNG.
- **Hồn spirit packs** (`assets/fx/hon_*`) — sheet luồng khí (không GLB thú full-body)  
  (`python3 scripts/assemble-hon-cc0.py` / `npm run assemble:hon`):  
  - GreatDog_ARt — [3 Dragon Animation Pack](https://opengameart.org/content/3-dragon-animation-pack) (CC0) → `hon_rong` serpent / mist  
  - Master484 — [Dragon 1](https://opengameart.org/content/dragon-1-m484) (CC0) → assemble trong `hon_rong`  
  - Blooming Pixels / Shepardskin snake (CC0) → `hon_xa`  
  - Segel2D Wolf + SpritePilot tiger → `wolf/` / `tiger/`  
  - n4 Whirlwind / water / thunder packs → `whirlwind/` / `hon_thuy` / `hon_loi`  
  Soft mist/orb: Kenney Particle Pack (**Transparent**).
- **Hồn 3D GLB** (`assets/fx/hon_3d/`) — **không dùng làm emission chính** (tránh summon thú 3D giữa sân).  
  Giữ file CC0 (Grab3D Loong / Quaternius / Kenney Cube Pets) phòng secondary rất nhỏ — xem `assets/fx/HON_PACKS.md`.
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

