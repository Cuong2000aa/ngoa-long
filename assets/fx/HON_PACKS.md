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

## Charge / form / hit — **lớp dày** (không săn pack “spirit thú”)

Runtime `emitHonSpiritSequence3d` chồng:

1. **CodeManu Free VFX** (`assets/fx/itch/codemanu/`) — OGA CC0, tải được  
   charge / vortex / fire / explosion / tentacles / electric_shield / wheel…
2. **Brackeys** (`itch/brackeys/`) — ember / storm / water / explosion…
3. **SpritePilot** (`itch/spritepilot/`) — explosion / fire / water_splash / hit_spark…
4. Ring/crescent/sparkle cũ trong `hon_*` (assemble CC0)

Import: `python3 scripts/import-codemanu-hon-fx.py`  
Map: `honElementLayers()` trong `battleVfx3d.ts`.

Do **not** use `npm run gen:hon-packs` for creature silhouettes.
