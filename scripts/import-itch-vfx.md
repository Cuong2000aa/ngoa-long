# Import itch.io free 3D Effects → Ngọa Long

Itch.io bật Cloudflare — agent **không tải được** zip tự động.  
Bạn tải tay → thả vào `_dl/itch-fx/drop/` → chạy script.

## Pack nên lấy (free, tag 3D+Effects)

| Pack | URL | Dùng cho motif |
|------|-----|----------------|
| **Brackeys' VFX Bundle** | https://brackeys.itch.io/brackeys-vfx-bundle | ✅ PNG flipbook — đã wire |
| **Stylized Projectiles** | https://laplahce.itch.io/stylized-projectiles-pack | ✅ Unity tex extract → slash/lightning/flash |
| Elemental / Battle / Electric / Dark / Status Free (binbun) | itch binbun | ❌ Free = Godot **shader**, không PNG |

Sau Brackeys: `python3 scripts/slice-brackeys-fx.py`  
Stylized (Unity zip): extract Texture2D → `assets/fx/itch/stylized/` (xem session import).

## Cách import

```bash
mkdir -p _dl/itch-fx/drop
# Copy *.zip đã tải vào drop/
python3 scripts/import-itch-vfx.py
```

Script chỉ **copy PNG/WebP flipbook** (bỏ `.tscn` / shader Godot / Unity) → `assets/fx/itch/{pack}/`  
và ghi `assets/CREDITS.md`.

## Runtime hiện tại (không cần itch)

440 chiêu không phải hồn thú đã dùng **Pixel Ability FX Forge** (Apache-2.0) trong `battleVfx3d`:

| Style 3D | Motif data | Forge pack |
|----------|------------|------------|
| bless | heal / buff | `radiance_aura` |
| barrier | shield | `ward_barrier` |
| beam | arcane / bagua | `arcane_burst` |
| shadow | shadow | `shadow_burst` |
| slash | slash | `blood_burst` / `earth_burst` |
| nova | fire | `ember_burst` |
| rush / charge | rush / charge | `earth_burst` |
| beam+thunder | thunder | `storm_burst` |

Hồn thú (150 chiêu) vẫn = GLB `hon_3d/` + sequence riêng.
