# Flash → VFX sheet map (Ngọa Long)

Chỉ sprite CC0 đã tải — không geometry procedural. Runtime: `src/battle/battleVfx.ts`.  
**AI handoff đầy đủ:** `docs/AI-HANDOFF-VISUAL-VFX.md`  
**Kenney:** chỉ `PNG (Transparent)` — không Black background (gây bóng hộp).

## Theo loại chiêu

| Loại | Flash ví dụ | Folder / sheet |
|------|-------------|----------------|
| Physical / cut | `white`, `steel`, `iron`, `brown` | `slash/` classic + `particles/slash_*` |
| Strategy / mưu thủy | `blue`, `cyan`, `blue_water`, `teal` | `slash/` blue · `water/` |
| Arcane / thần | `purple`, `violet`, `bagua` | `arcane/` · slash purple |
| Blood / son | `crimson`, `dark_red`, `gold_red`, `red` | `blood/` · slash fire |
| Fire ultimate | `fire_rain`, `red_fire` | `fire-wrath/` |
| Độc / hỏa lục | `poison`, `green_poison`, `fire_green` | Kenney + `arcane/` tint lục |
| Rắn | `snake` | Kenney + `water/` tint lục |
| Rồng | `dragon` | `dragon/` + `fire-wrath/` |
| Lốc / gió | `wind` `whirlwind` | `water/` + Kenney aura (tạm; chờ pack whirlwind CC0) |
| Sói | `wolf` | `blood/` + slash fire tối (tạm; chờ sprite sói CC0) |
| Khiên / Thiết Bích | `gold_soft` | `pure/` |
| Fire projectile | `orange`, `fire` | `skill/starsteel/Fireball*` |
| Thunder | `thunder` | `skill/starsteel/Thundersphere*` |
| Gold / kim | `gold`, `gold_soft`, `gold_pierce`, `yellow*` | `pure/` |

## Theo phẩm wiki (look DISTINCT)

| Phẩm | Nhìn chính |
|------|------------|
| Thường | Kenney particles + slash classic nhỏ |
| Chiến | slash blue / water cyan |
| Thần | arcane + slash purple |
| Truyền thuyết | blood / slash fire |
| Thần Hoàng | fire-wrath + pure + light overlay (aura lớn hơn) |

## Licenses

Tất cả pack trên: **CC0** (Kenney, Cethiel, StarsteelGaming, SpritePilot). Chi tiết → `assets/CREDITS.md`.
