# Skill qi-stream packs

Runtime folder: `assets/fx/skill/{rong|xa|ho|…}/qi_*`  
Code id vẫn `hon_rong` / `hon_xa` / … (xem `honPackForStyle`).

## Emission = qi sheet

1. **Charge** — `charge_01..04` (vòng đất)
2. **Flight** — `flight_01..04` (đầu dẫn)
3. **Impact** — `impact_01..03` (+ `strike_*` cho bagua)

| Code id | Folder | Palette |
|---------|--------|---------|
| `hon_rong` | `skill/rong/qi_fire` · `qi_azure` · `qi_ivory` | lửa · thanh · bạch |
| `hon_xa` | `skill/xa/qi_poison` | lục độc |
| `hon_ho` | `skill/ho/qi_tiger` | hổ phách |
| `hon_soi` | `skill/soi/qi_wolf` | xám bạc |
| `hon_thuy` | `skill/thuy/qi_water` | lam nước |
| `hon_loi` | `skill/loi/qi_thunder` | vàng sét |
| `hon_phong` | `skill/phong/qi_wind` | cyan gió |
| `hon_bagua` | `skill/bagua/qi_bagua` | pháp trận đa màu |
| `hon_hon` | `skill/hon/qi_soul` | linh hồn |

Gen: `python3 scripts/gen-qi-spirit-packs.py`  
Index: `assets/fx/README.md`
