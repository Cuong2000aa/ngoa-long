# assets/fx — Skill & battle VFX

Chỉ giữ asset runtime (đã dọn legacy):

```
fx/
  skill/          # Chiêu hồn qi-stream (charge → flight → impact) ≥24 frame
    rong/ · xa/ · ho/ · soi/ · thuy/ · loi/ · phong/ · bagua/ · hon/
  itch/           # Underlay CodeManu / Brackeys / SpritePilot / … ≥24 frame
  particles/      # Kenney — AA, spark, status (stem combat ≥24)
  slash/          # Chém kiếm (classic / blue / purple / fire) ≥24 frame
  whirlwind/      # Kỵ xung / gió ≥24
  forge/          # frost / tide / nature ≥24
```

Gen dày flipbook (giữ hình tượng, không remap chéo):
- Hồn: `python3 scripts/expand-qi-flipbook.py`
- Còn lại (kiếm/cung/tiễn/itch/forge…): `python3 scripts/expand-fx-flipbook.py`

Chi tiết pack hồn: `HON_PACKS.md` · credits: `../CREDITS.md`.
