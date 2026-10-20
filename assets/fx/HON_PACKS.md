# Hồn spirit packs (CC0 creatures)

## Thân hồn bay — **bắt buộc GLB 3D** (`hon_3d/`)

| GLB | Pack | Source |
|-----|------|--------|
| `hon_3d/dragon.glb` | hon_rong, hon_loi | Grab3D Chinese Dragon / Loong (CC0) |
| `hon_3d/snake.glb` | hon_xa | Quaternius / Poly Pizza (CC0) |
| `hon_3d/wolf.glb` | hon_soi | Quaternius / Poly Pizza (CC0) |
| `hon_3d/tiger.glb` | hon_ho | Kenney Cube Pets (CC0) |
| `hon_3d/fish.glb` | hon_thuy | Kenney Cube Pets (CC0) |
| `hon_3d/wind.glb` | hon_phong | Kenney Cube Pets parrot (CC0) |

Runtime: `battleVfx3d.ts` → `GLTFLoader`. **Không** tự gen mesh thú.

## Charge / hit sheets (sprite CC0)

Assembled by `python3 scripts/assemble-hon-cc0.py` — ring/crescent/sparkle only (not the flying body).

| Folder | Look | Source |
|--------|------|--------|
| `hon_rong/` | charge fire | GreatDog_ARt / Master484 / Kenney particles |
| `hon_xa/` | poison | Blooming Pixels / Shepardskin overlays |
| `hon_ho/` | tiger | SpritePilot claw/roar |
| `hon_soi/` | wolf | Segel2D |
| `hon_thuy/` | water | Cethiel Water |
| `hon_loi/` | thunder | Starsteel |
| `hon_phong/` | whirl | n4 Whirlwind |

Do **not** use `npm run gen:hon-packs` for creature silhouettes.
