# Skill qi-stream packs

Runtime folder: `assets/fx/skill/{rong|xa|ho|…}/qi_*`  
Code id vẫn `hon_rong` / `hon_xa` / … (xem `honPackForStyle`).

## Emission = qi sheet

Mọi pack dưới `assets/fx/skill/*/qi_*` — **≥24 frame / stem**:

1. **Charge** — `charge_01..24`
2. **Flight** — `flight_01..24` (frame 1 xuất chiêu → 24 trúng địch)
3. **Impact** — `impact_01..24` (+ `strike_01..24` bagua)

| Code id | Folder | Identity | Gen |
|---------|--------|----------|-----|
| `hon_rong` | `qi_fire` · `qi_azure` · `qi_ivory` | rồng | `gen-qi-fire-serpentine.py` + `gen-qi-spirit-packs.py` (azure/ivory) |
| `hon_xa` | `qi_poison` | xà | `gen-qi-creature-packs.py` |
| `hon_ho` | `qi_tiger` | hổ | `gen-qi-skill-motion.py` (chiêu ngang) |
| `hon_soi` | `qi_wolf` | sói | `gen-qi-skill-motion.py` |
| `hon_thuy` | `qi_water` | thủy | `gen-qi-creature-packs.py` |
| `hon_loi` | `qi_thunder` | lôi thú | `gen-qi-skill-motion.py` |
| `hon_phong` | `qi_wind` | phong điểu | `gen-qi-skill-motion.py` |
| `hon_bagua` | `qi_bagua` | pháp trận (sigil cũ) | **không đụng** |
| `hon_hon` | `qi_soul` | caster hiện hồn; ally buff hiện hồn; địch = sét màu theo skill | giữ `main` — **không** gen like-soi |
| *(sét dọc)* | `loi/qi_crimson` | hồng / xích / viêm lôi | `gen-qi-crimson-thunder.py` |
| | `loi/qi_violet` | trấn/tỏa/đế/truy hồn, tử điện | `gen-qi-colored-thunder.py` |
| | `loi/qi_azure` | thanh long hồn | ↑ |
| | `loi/qi_gold` | lôi kích / thần lôi / bạo lôi… | ↑ |
| | `loi/qi_venom` | độc lôi | ↑ |
| | `loi/qi_gale` | phong lôi | ↑ |

**Không** remap hổ/sót từ silhouette rồng.  
Index: `assets/fx/README.md`
