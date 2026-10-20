# Flash → VFX sheet map (Ngọa Long)

Chỉ sprite CC0 đã tải — không geometry procedural. Runtime: `src/battle/battleVfx.ts`.  
**AI handoff đầy đủ:** `docs/AI-HANDOFF-VISUAL-VFX.md`  
**Kenney:** chỉ `PNG (Transparent)` — không Black background (gây bóng hộp).

## Tấn công thường theo binh chủng (BattleRenderer.attack)

| Troop | FX |
|-------|-----|
| infantry | slash classic (`white`) |
| spear | slash `steel` + pierce beam |
| cavalry | **xung kích** `spawnCavalryCharge` (bụi vó + earth impact + địch đẩy lùi) |
| archer | projectile `thunder` |
| strategist | projectile `bagua` |

## Chiêu bám tên (QA)

| Tên / motif | Flash | VFX |
|-------------|-------|-----|
| Thiết Bích / hộ thể | `shield` | vòng khiên vàng (`spawnShieldBarrier`) |
| Đột Kích / Tập Kích | `rush` | xông đâm thương/bộ (`spawnRushAssault`) — **không** ngựa |
| Kỵ Liệp / Kỵ Kích | `charge` | ngựa tông (`spawnCavalryCharge`) |
| *Thích (Liên/Xuyên…) | `steel` + pierce | đâm thép |
| Hổ / Lôi / Độc / Lốc… | tiger/thunder/poison/whirlwind | sheet đúng motif |

Chiêu (`skillFlash`): **timeline** `NLSkillDesign.playTimeline` — windup → cast → emission → impact (mọi skill).  
Juice: windup glow, aura theo scale S/M/L, `spawnPremiumImpact`, camera punch, hit-stop.  
Motif đặc biệt: charge / rush / shield vẫn choreography riêng. `skill_wave` chỉ emission+impact.  
**Polished library** (`src/battle/skillFxLibrary.ts`): `basic_strike` / `hoa_long` / `ho_khieu` / `dot_kich` — choreography riêng theo `skillId`. ≠ AA.  
**Forge packs** (`assets/fx/forge/*`, Apache-2.0 Pixel Ability FX Forge): sheet theo element — frost/storm/ember/shadow/blood/earth/nature/tide/arcane/radiance/ward. Generate: `node scripts/forge-generate-fx.mjs`.  
**Hỗ trợ / sĩ khí** (`[Hỗ Trợ]`, Thiên Mệnh…): `buff` / `gold_soft` → `spawnAllyBless` đồng minh — **không** `slash`/`steel` AoE nova địch.

## Theo loại chiêu

| Loại | Flash ví dụ | Folder / sheet |
|------|-------------|----------------|
| Hỗ trợ / sĩ khí | `gold_soft`, `gold`, `buff`, `heal` | `pure/` + ally bless |
| Physical / cut | `white`, `steel`, `iron`, `brown` | `slash/` classic + `particles/slash_*` |
| Strategy / mưu thủy | `blue`, `cyan`, `blue_water`, `teal` | `slash/` blue · `water/` |
| Arcane / thần | `purple`, `violet`, `bagua` | `arcane/` · slash purple |
| Blood / son | `crimson`, `dark_red`, `gold_red`, `red` | `blood/` · slash fire |
| Fire ultimate | `fire_rain`, `red_fire` | `fire-wrath/` |
| Độc / hỏa lục | `poison`, `green_poison`, `fire_green` | Kenney + `arcane/` tint lục |
| Rắn | `snake` | Kenney + `water/` tint lục |
| Rồng | `dragon` | `dragon/` + `fire-wrath/` |
| Lốc / gió | `wind` `whirlwind` | `whirlwind/` (n4 CC0) |
| Sói | `wolf` | `wolf/` (Segel2D Attack, tint tối) |
| Hổ / gầm | `tiger` | `tiger/` roar+claw+slam (SpritePilot CC0) — **không** dùng fireball |

**Motif → flash:** `resolveFxKey` — motif *dedicated* (tiger/wolf/dragon/fire/…) thắng flash generic; slash/arcane/heal giữ flash chi tiết trong data.

## Recipe aura (mọi motif)

| Motif | Flash | Aura chính + overlay |
|-------|-------|----------------------|
| slash | white/steel/crimson… | slash sheet + Kenney slash + earth |
| arcane | blue | slash blue + arcane |
| heal / buff / shield | gold_soft / pure | pure + hit spark |
| shadow | purple | arcane + slash purple |
| fire | fire_rain | fire-wrath + fireball |
| thunder | thunder | thundersphere + pure |
| water | blue_water | water + slash blue |
| poison / snake | green_poison / snake | poison + magic/snake |
| dragon | dragon | dragon + fire-wrath |
| tiger | tiger | roar + claw + slam |
| wolf | wolf | wolf + slash fire |
| whirlwind | whirlwind | whirlwind + aura |
| bagua | bagua | arcane + pure |
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
