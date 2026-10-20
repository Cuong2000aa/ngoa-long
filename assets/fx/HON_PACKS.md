# Hồn spirit packs — qi-stream (style Hỏa Long)

## Emission chính = qi sheet (không GLB thú)

Runtime `emitHonSpiritSequence3d` khi có `qi_*`:

1. **Charge** — vortex tụ lực (`charge_01..04`)
2. **Flight** — **1** silhouette bay, `headOnRight` + `headLeadFrac` (đầu đâm địch)
3. **Impact** — bùm đúng lúc đầu chạm (`impact_01..03`)

| Pack | Qi folder | Palette / motif |
|------|-----------|-----------------|
| `hon_rong` | `qi_fire` / `qi_azure` / `qi_ivory` | lửa · thanh · bạch |
| `hon_xa` | `qi_poison` | lục độc |
| `hon_ho` | `qi_tiger` | hổ phách |
| `hon_soi` | `qi_wolf` | xám bạc |
| `hon_thuy` | `qi_water` | lam nước |
| `hon_loi` | `qi_thunder` | vàng sét |
| `hon_phong` | `qi_wind` | cyan gió |

Gen / expand: `python3 scripts/gen-qi-spirit-packs.py`  
Seed AI (hổ/sói): `…/qi_*/qi_seed/` · credits: `assets/CREDITS.md`.

## Legacy

`serpent_*` / `fx/dragon` / `tiger` / `wolf` — underlay hoặc fallback cũ.  
`hon_3d/*.glb` — **không** emission chính.
