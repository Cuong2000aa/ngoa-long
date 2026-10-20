# Ngọa Long — AI Handoff: Visual / VFX / Asset / Wiki

> **Dùng file này khi import sang AI khác.** Đọc hết trước khi sửa UI trận, chiêu, unit art, nền, buff/debuff.  
> Rule Cursor rút gọn: `.cursor/rules/tam-quoc-visual-assets.mdc`  
> Credits đầy đủ: `assets/CREDITS.md`  
> Flash map ngắn: `assets/fx/FLASH_MAP.md`

---

## 0. Mục tiêu sản phẩm

Fan remake **Ngọa Long / Tam Quốc** — SRPG 2.5D (sprite trên sân Three.js), layout học wiki H5 “Xem kỹ năng”, **không** nhúng client H5 VNG.

Stack: **Vite + TypeScript + Three.js** · data JSON · combat JS (`js/combat/*`).

---

## 1. CẤM / BẮT BUỘC (không được “bỏ vì tiện”)

### CẤM

| Việc | Vì sao |
|------|--------|
| Procedural mesh “người đậu”, geometry nhân vật tự vẽ | Không đúng thẩm mỹ TQ / rule cứng |
| Tự paint portrait / terrain chính | Phải lấy asset |
| Tự gen blob / silhouette thú cho Hồn (rồng/xà/hổ…) | Bắt buộc **GLB CC0** trong `assets/fx/hon_3d/` |
| VFX ring / sphere / beam bằng `SphereGeometry` / tự dựng | Dùng sprite sheet CC0 |
| Kenney Particle Pack bản **PNG (Black background)** | Gây **viền/bóng hộp đen** quanh chiêu |
| Chồng nhiều layer FX nền đen (LightEffect + Fireball + scorch) | Hộp mờ additive |
| Quaternius Knight / art Tây làm tướng TQ (trừ recolor đúng theme) | Sai thẩm mỹ |
| Hổ Báo / Thiên binh cho **troopTier 1** | Wiki: Hổ Báo Kỵ chỉ cavalry **tier ≥ 5** |
| Commit / push / amend git khi user không yêu cầu | User rule |

### BẮT BUỘC

1. Tìm asset **free / CC0 / CC-BY** trên mạng → tải vào `assets/` → fit pipeline.  
2. Ghi nguồn + license vào **`assets/CREDITS.md`**.  
3. Unit/cảnh/VFX = file trong `assets/` (hoặc URL `import.meta`) — **không** 404 / material đen.  
4. Data chiêu / hiệu ứng bám **wiki VNG** (link bên dưới), không bịa tên status.  
5. Trả lời / PR note ngắn: **nguồn asset** + pattern học được (nếu có).

---

## 2. Wiki & data chuẩn (học từ đây)

| Chủ đề | URL | File local |
|--------|-----|------------|
| Binh chủng / cấp | https://ngoalong.vnggames.com/ngoa-long-wiki/binh-chung | `data/troops.json`, `assets/units/battle/wiki-*`, `tier-map.json` |
| Hiệu ứng buff/debuff | https://ngoalong.vnggames.com/ngoa-long-wiki/hieu-ung | `data/status-effects.json` (+ `wikiCatalog` ~320) · docs `docs/wiki/HIEU-UNG.md` |
| Hiệu ứng (bảng tin) | https://ngoalong.vnggames.com/tin-tuc/tin-tuc/hieu-ung-chien-dau.html | merge vào `wiki-effects.json` |
| Import hiệu ứng | — | `scripts/import-wiki-effects.py` → rebuild bundle |
| Binh chủng docs | wiki binh-chung | `data/troops-wiki.json` · `docs/wiki/BINH-CHUNG.md` · `docs/wiki/SOURCES.md` |
| Chiêu / phẩm | wiki võ tướng + tabs phẩm | `data/skills.json`, `qualityLadders`, `skillsByQuality` |
| Layout trận H5 | wiki “Xem kỹ năng” (vd. hero pattern Trương Liêu) | `BattleRenderer` L–R |

**Rebuild DB sau khi sửa `data/*.json` (UTF-8 bắt buộc):**

```powershell
powershell -File scripts/rebuild-db.ps1
# hoặc trực tiếp:
py -3 scripts/rebuild-bundle-utf8.py
```

`rebuild-db.ps1` **chỉ** gọi Python UTF-8 — không ghép JSON bằng PowerShell (sẽ hỏng dấu tiếng Việt).  
Output: `js/db/nl-db.bundle.js` (offline `NL_DB`).

**Font:** self-host `assets/fonts/BeVietnamPro-*.ttf` + `be-vietnam-pro.css` (`font-display: swap`). Không Google Fonts subset.

**Không commit / không giữ trong repo:** `_dl/`, `assets-src/`, `assets/packs/`, `assets/**/_dl/`, `dist/`, screenshot `fix3-*.png` (xem `.gitignore`).

---

## 3. Thẩm mỹ & layout trận

- Palette: son/huyết, lục/lam, kim/đồng cổ, gỗ nâu — **không** purple-UI generic / knight Tây / chibi procedural.  
- **Phe ta TRÁI / địch PHẢI**, đối mặt; cụm lính + cờ sau lưng; unit nhỏ kiểu SRPG.  
- HUD: portrait chip + HP + sĩ khí + **chip status** (`.uo-status`).  
- Camera: nhìn cả đội hình, không close-up chiếm nửa màn.  
- Nền trận: `assets/battle/battle-courtyard.jpg` (+ billboard cung CC0 nếu có).  
- Facing: flip canvas / orientation đúng phe — **không** `scale.x` âm làm lật mesh sai.

**troopTier**

- Cấp 1 = Bộ / Thương / Kỵ / Cung / Quan văn thường.  
- `assets/units/sheets/hobao-ky.png` chỉ **cavalry tier ≥ 5**.  
- Art: `assets/units/battle/wiki-{type}-t{1..6}.png` + sheets transform icon — không vẽ tướng mới.

---

## 4. Pipeline VFX (QUAN TRỌNG — tránh viền đen)

### Runtime

- 2D overlay: **`src/battle/battleVfx.ts`**  
- 3D hồn bay: **`src/battle/battleVfx3d.ts`** — thân hồn = **luồng khí sheet** (`dragon`/`tiger`/`wolf`/`hon_*/serpent`), charge/hit = CodeManu + `hon_*`. **Không** GLB full-body làm emission.  
- Gọi từ: `BattleRenderer.skillFlash` / attack / hit.  
- Combat events: `js/combat/combat-engine.js` → `js/combat/combat-ui.js` → `_battle3d.skillFlash(...)`.

### Nguyên tắc render

1. Overlay chiêu: **sprite sheet** — Additive / premultiplied, `depthWrite: false`, `depthTest: false` trên FX. Hồn thú = **qi stream silhouette** (flipbook CC0), không blob procedural, không summon GLB thú.  
2. Mọi texture FX qua `prepareFxTexture()`: nền đen → alpha, premultiply RGB, cắt fringe tối.  
3. Blending: `CustomBlending` + `OneFactor` / `OneFactor` + `premultipliedAlpha: true`.  
4. Aura chiêu: **1 sheet chính + Kenney chân** — không chồng LightEffect + scorch opaque.  
5. Kenney: **bắt buộc** bản **`PNG (Transparent)`** từ  
   https://kenney.nl/assets/particle-pack  
   (zip → folder `PNG (Transparent)` → `assets/fx/particles/`).  
   ❌ Không dùng `PNG (Black background)`.

### Triệu chứng & nguyên nhân đã gặp

| Hiện tượng | Nguyên nhân | Fix |
|------------|-------------|-----|
| Viền vuông / bóng hộp mờ quanh chiêu | Sheet nền đen đặc (Kenney Black BG / Cethiel) + chồng layer | Transparent Kenney + `prepareFxTexture` + ít layer |
| Material đen / path 404 | Sai path Vite / chưa copy asset | Path `assets/...` tồn tại, CREDITS |

### Flash → sheet (rút gọn)

| Flash | Sheet chính | Ghi chú |
|-------|-------------|---------|
| `white` `steel` `iron` `brown` | `fx/slash` classic + Kenney slash | Vật lý thường |
| `blue` `cyan` `blue_water` `teal` | slash blue / `fx/water` | Mưu thủy |
| `purple` `violet` `bagua` | `fx/arcane` | Thần / bát quái |
| `crimson` `dark_red` `gold_red` `red` | `fx/blood` + slash fire | Son/huyết |
| `fire_rain` `red_fire` | `fx/fire-wrath` | Ultimate hỏa |
| `orange` `fire` | Starsteel Fireball | Đạn lửa |
| `thunder` | Starsteel Thundersphere | Sét |
| `gold*` `yellow*` | `fx/pure` | Kim / buff |
| `dragon` | `fx/dragon` + fire-wrath | Chiêu rồng (Nineball CC0) |
| `tiger` | `fx/tiger/` roar+claw+slam | Hổ Khiếu — SpritePilot CC0 (không fireball) |
| `wolf` | `fx/wolf/` | Sói (Segel2D) |
| `whirlwind` `wind` | `fx/whirlwind/` | Lốc |
| `snake` | Kenney + water tint lục | Rắn |
| `poison` `green_poison` `fire_green` | Kenney + arcane tint lục | Độc |

**Motif runtime (ALL chiêu):** mọi skill có `fx.motif` + `fx.flash`.  
`resolveFxKey`: motif *dedicated* (tiger/wolf/dragon/fire/thunder/water/poison/snake/whirlwind/bagua/shield) thắng flash generic; slash/arcane/heal/buff/shadow giữ flash chi tiết.  
`spawnSkillAura` dùng `auraRecipe(flash)` — mỗi flash có main+overlay(+ground) sprite CC0. Engine emit `motif` trên event `skill`.

Chi tiết path: `assets/fx/FLASH_MAP.md` · code: `sheetForFlash()` trong `battleVfx.ts`.

### Chiêu cao đã có trong data

| skillId | Tên | flash | Effects wiki |
|---------|-----|-------|--------------|
| `hoa_long` | Hỏa Long | `dragon` | `burn` → Thiêu đốt |
| `doc_xa` | Độc Xà | `snake` | `poison` + `atk_down` |
| `doc_muu` | Độc Mưu | `green_poison` | `poison` |
| `long_nu` | Long Nỗ | `dragon` | — |

Thêm chiêu mới: sửa `data/skills.json` → rebuild bundle → map flash trong `battleVfx.ts` + `js/combat/skill-design.js`.

---

## 5. Buff / Debuff / Control (wiki → UI)

### Data

`data/status-effects.json` — map engine type → tên wiki:

| Engine | Wiki (hiển thị) | kind |
|--------|-----------------|------|
| `stun` | Hỗn loạn | control |
| `silence` | Ám tế | debuff |
| `poison` | Trúng độc | debuff |
| `burn` | Thiêu đốt | debuff |
| `atk_up` | Anh dũng | buff |
| `atk_down` | Giảm công | debuff |
| `def_up` | Kiên thủ | buff |
| `def_down` | Phá thủ / Hạ thấp phòng thủ | debuff |

### Wire

1. `combat-engine.js` — `applyEffects(..., uiEvents)` → event `{ type: "status", uid, statuses }`.  
2. `combat-ui.js` — `setStatuses` trên BattleRenderer + float text.  
3. HUD CSS: `.uo-st-buff` / `.uo-st-debuff` / `.uo-st-control` trong `css/combat.css`.  
4. VFX phụ: `spawnStatusOrb(scene, at, "buff"|"debuff")`.

Thêm status mới: cập nhật wiki map JSON + `STATUS_META` trong engine + CSS nếu cần — **không** bịa tên lệch wiki.

---

## 6. Nguồn asset ưu tiên (free)

Luôn ghi `assets/CREDITS.md` khi thêm.

| Nguồn | License | Dùng cho |
|-------|---------|----------|
| [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) | CC0 | FX particles — **Transparent only** |
| [Cethiel OGA](https://opengameart.org/users/cethiel) (Arcane, Light, Earth, Fire Wrath, Slash, Blood, Water, Pure…) | CC0 | Skill sheets theo flash |
| [Starsteel Spell Effects](https://opengameart.org/content/spell-effects-by-starsteelgaming) | CC0 | Fireball / Thunder |
| [SpritePilot magic](https://spritepilot.com/free-game-assets/magic) | CC0 | Strip heal/shield… |
| [Fire Dragon Roller — Nineball](https://opengameart.org/content/fire-dragon-roller) | CC0 | `assets/fx/dragon/` |
| OpenGameArt / Poly Pizza / itch CC0 / FreeGameSprites | CC0/CC-BY | Unit props, cung, UI |
| Unsplash (courtyard / palace) | Unsplash License | `assets/battle/*.jpg` |
| Wiki VNG icons | Fan remake only (IP VNG) | `assets/units/battle/wiki-*` |

**Không** scrape / nhúng asset client game VNG chính thức.

---

## 7. File “đụng tới” khi làm chiêu / visual trận

```
src/battle/battleVfx.ts          # VFX sprite + prepareFxTexture + flash map
src/battle/BattleRenderer.ts     # sân 3D, skillFlash, HUD status
src/battle/battleActors.ts       # cụm lính, cờ, sheet unit
js/combat/combat-engine.js       # effects, status events
js/combat/combat-ui.js           # play events → 3D
js/combat/skill-design.js        # flash → timeline UI 2D
data/skills.json                 # chiêu + fx.flash + effects
data/status-effects.json         # map wiki status
data/troops.json                 # binh chủng / tier
assets/fx/**                     # sheets
assets/CREDITS.md                # bắt buộc cập nhật
assets/fx/FLASH_MAP.md           # map flash
css/combat.css                   # HUD + uo-status
css/combat-vfx.css               # float text
scripts/rebuild-db.ps1           # regenerate NL_DB
```

---

## 8. Checklist trước khi coi xong task visual/VFX

```
✅ Không mesh/geometry VFX tự vẽ
✅ Asset nằm trong assets/ + CREDITS.md có nguồn + license
✅ Kenney particles = Transparent (không Black background)
✅ Chiêu không còn viền/bóng hộp đen (prepareFxTexture + ít layer)
✅ flash trong skills.json map được trong battleVfx.sheetForFlash
✅ Buff/debuff tên đúng wiki; HUD chip hiện khi applyEffects
✅ troopTier / Hổ Báo đúng bậc wiki
✅ Camera / L–R / facing đúng
✅ Sửa data/*.json → rebuild nl-db.bundle.js
✅ Hard refresh trình duyệt sau đổi texture (Ctrl+F5)
```

---

## 9. Prompt gợi ý khi giao AI khác

```text
Làm theo docs/AI-HANDOFF-VISUAL-VFX.md và .cursor/rules/tam-quoc-visual-assets.mdc.
Cấm tự vẽ nhân vật/VFX geometry. Asset CC0 → assets/ + CREDITS.md.
VFX: Kenney PNG Transparent + prepareFxTexture; không Black background.
Data chiêu/status từ wiki Ngọa Long (hieu-ung, binh-chung) + data/*.json.
Trả lời tiếng Việt; ghi nguồn asset đã dùng.
```

---

*Cập nhật kèm session fix viền đen chiêu + status wiki + flash dragon/snake/poison (2026-10).*
