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
  → `assets/fx/dragon_spirit/` (legacy soft silhouettes)
- **Hồn spirit packs** (`assets/fx/hon_*`) — assemble từ sprite CC0 thật  
  (`python3 scripts/assemble-hon-cc0.py` / `npm run assemble:hon`):  
  - GreatDog_ARt — [3 Dragon Animation Pack](https://opengameart.org/content/3-dragon-animation-pack) (CC0) → `hon_rong`  
  - Master484 — [Dragon 1](https://opengameart.org/content/dragon-1-m484) (CC0) → `hon_rong` head frames  
  - Blooming Pixels — [Snake Sprite Sheet](https://opengameart.org/content/snake-sprite-sheet) (CC0) → `hon_xa`  
  - Shepardskin — [Snake RPG Character](https://opengameart.org/content/snake-rpg-character) (CC0) → `hon_xa`  
  - Segel2D Wolf + SpritePilot tiger claw/roar → `hon_soi` / `hon_ho`  
  - Cethiel Water / Starsteel Thunder / n4 Whirlwind → `hon_thuy` / `hon_loi` / `hon_phong`  
  Soft mist/orb: Kenney Particle Pack. **Không** dùng procedural blob làm silhouette thú.
- **Hồn 3D GLB** (`assets/fx/hon_3d/`) — thân hồn bay trong `battleVfx3d` (bắt buộc mesh, không tự gen):  
  - **Dragon (Á Đông / Loong)** — [Grab3D Chinese Dragon](https://grab3d.com/models/creatures/chinese-dragon/) (CC0) → `dragon.glb` (`hon_rong`, `hon_loi`); tối ưu meshopt ~1.4MB  
  - **Snake / Wolf** — Quaternius via [Poly Pizza](https://poly.pizza) (CC0) → `snake.glb`, `wolf.glb`  
  - **Tiger / Fish / Parrot** — [Kenney Cube Pets](https://kenney.nl/assets/cube-pets) (CC0) → `tiger.glb`, `fish.glb`, `wind.glb` (+ `Textures/colormap.png`)
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
  → atlases `assets/fx/itch/brackeys_vfx_bundle/` · slice `assets/fx/itch/brackeys/{pack}/`  
  Runtime ưu tiên cho chiêu non-spirit.
- **Stylized Projectiles** — https://laplahce.itch.io/stylized-projectiles-pack  
  (Unity demo build → extract Texture2D) → `assets/fx/itch/stylized/{slash_a,lightning,flash,star_sheet_*}/`  
  Overlay slash / thunder / beam.
- **Binbun Free** (Electric / Dark Magic / Status / Battle / Elemental) — Godot **shader-only**, không PNG flipbook → không dùng.

## GitHub auto-import VFX
- **superpowers_rpg_fx** — Sparklin Superpowers CC0 → `assets/fx/itch/superpowers_rpg_fx/` (30 png)
- **superpowers_ninja_fx** — Sparklin Superpowers CC0 → `assets/fx/itch/superpowers_ninja_fx/` (17 png)
- **superpowers_medieval_fx** — Sparklin Superpowers CC0 → `assets/fx/itch/superpowers_medieval_fx/` (2 png)
- **superpowers_prehistoric_fx** — Sparklin Superpowers CC0 → `assets/fx/itch/superpowers_prehistoric_fx/` (30 png)
- **rpicster_particles** — RPicster Godot VFX textures CC0 → `assets/fx/itch/rpicster_particles/` (66 png)

## CodeManu + SpritePilot (hồn upgrade)
- **CodeManu Free VFX Pack** — CC0 — https://opengameart.org/content/free-vfx-asset-pack
  → `assets/fx/itch/codemanu/{charged , vortex , dithered_fire , pixel_fire , magma , explosion , explosion2 , kabooms , anima , constellation , puff_stars , electric_shield , tentacles , worm , hyperspeed , elden_ring , impact , big_hit , wheel , power_chords}/` (30fps subsampled)
- **SpritePilot Free Effects** — CC0 — https://spritepilot.com/free-game-assets/effects
  → `assets/fx/itch/spritepilot/{explosion , smoke_puff , landing_dust , hit_spark , fire , water_splash , magic_sparkle}/`

