# Skill FX 3D Rebuild

## Mục tiêu

Làm lại **toàn bộ** hoạt ảnh chiêu theo hướng **true 3D** (Points + mesh/spirit trong world space), không còn phụ thuộc billboard Kenney 2D làm lớp chính.

Asset sheet cũ (Kenney / Cethiel) bị **hạ cấp** → chỉ còn fallback / AA. Nhìn chính = `battleVfx3d` + forge packs (Apache-2.0 Pixel Ability FX Forge) + spirit mesh (Hỏa Long…).

## Pipeline

| Lớp | Vai trò |
|-----|---------|
| `resolveFx3dStyle(flash, motif, pattern)` | Map mọi chiêu → style 3D |
| `playSkillFx3d` | Emission / impact theo style |
| `playPatternFx3d` | column / row / all / ally_all / self |
| `assets/fx/forge/*` | Sheet element mới (generate: `node scripts/forge-generate-fx.mjs`) |
| `assets/fx/hon_*/*` | Spirit packs từ **sprite CC0 thật** (`npm run assemble:hon`) — không procedural blob |
| `assets/fx/HON_PACKS.md` | Nguồn OGA / Kenney / SpritePilot |
| `assets/fx/dragon_spirit/*` | Legacy soft silhouettes |
| `preview-skill-3d.html` | Gallery duyệt mọi motif |

## Style map (flash / motif → 3D)

| Style | Khi nào | Nhìn |
|-------|---------|------|
| `slash` | steel / white / iron / slash motif | Trail lưỡi kiếm + dust |
| `rush` | rush / pierce / thrust | Core bay thấp + streak |
| `charge` | charge / brown / cavalry | Bụi đất dày + shockwave |
| `breath` | dragon | **hon_rong** — 4 pha hồn (cam lửa) |
| `roar` | tiger / wolf | **hon_ho** / **hon_soi** — 4 pha hồn |
| `beam` | blue / arcane / purple / bagua | Trail đạn pháp |
| `beam`+thunder | thunder | **hon_loi** — 4 pha hồn |
| `nova` | fire_rain / all-AoE fire | Burst + shockwave tại đích |
| `tide` | blue_water / cyan / water | **hon_thuy** — 4 pha hồn |
| `poison` | green_poison / snake | **hon_xa** — 4 pha hồn |
| `whirl` | whirlwind | **hon_phong** — 4 pha hồn |
| `shadow` | crimson / purple shadow | Burst máu/bóng |
| `bless` | gold_soft / heal / buff / ally | Radiance aura đồng minh |
| `barrier` | shield | Ward ring quanh caster |

## Vẽ lại asset

1. **Procedural 3D** (ưu tiên): soft particle maps + mesh glow — không cần PNG cho mọi motif.
2. **Forge PNG**: regenerate đủ element (frost/storm/ember/shadow/blood/earth/nature/tide/arcane/radiance/ward + poison/whirl nếu forge hỗ trợ).
3. **Spirit sheets**: dragon_spirit (đã có); mở rộng tiger/wolf spirit khi polish tiếp.
4. Không reuse Kenney box-shadow / cream wash làm look chính.

## Trạng thái

- [x] Branch `cursor/skill-fx-3d-rebuild-a449` từ main (gallery + Hỏa Long)
- [x] `resolveFx3dStyle` + mở rộng styles
- [x] `BattleRenderer.skillFlash` ưu tiên 3D cho mọi chiêu
- [ ] Generate forge packs còn thiếu / regenerate full
- [ ] Gallery list đủ mọi flash key
- [ ] Browser QA catalog trên pipeline 3D
