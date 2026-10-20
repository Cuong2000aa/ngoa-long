# Import free VFX (itch / OpenGameArt) → Ngọa Long

Itch.io / OGA thường chặn auto-DL (Cloudflare).  
Bạn tải tay → thả `.zip` vào `_dl/itch-fx/drop/` → báo agent chạy import.

## Đã auto-tải được (GitHub)

| Pack | URL | Status |
|------|-----|--------|
| Kenney Particle Pack | https://github.com/Calinou/kenney-particle-pack | ✅ (đã có `assets/fx/particles`) |
| RPicster VFX textures | https://github.com/RPicster/Godot-particle-and-vfx-textures | ✅ `itch/rpicster_particles` |
| Superpowers asset packs | https://github.com/sparklinlabs/superpowers-asset-packs | ✅ `itch/superpowers_*` + curated |

## Pack itch/OGA (thường Cloudflare — tải tay nếu được)

| Pack | URL | Ghi chú |
|------|-----|---------|
| Brackeys / Stylized | itch | ✅ Đã wire trước đó |
| CodeManu / PVFX Foundry | OGA / itch | ❌ Agent không tải được |

## Pack **không** dùng

Binbun Free = Godot shader.

## Sau khi thả zip

```bash
# copy zip vào drop (hoặc báo path Downloads)
mkdir -p _dl/itch-fx/drop
cp ~/Downloads/*.zip _dl/itch-fx/drop/   # chọn file cần

npm run import:itch-fx
python3 scripts/slice-brackeys-fx.py      # nếu có Brackeys
# CodeManu / PVFX: agent slice → assets/fx/itch/codemanu|pvfx/ rồi wire
```

## Runtime hiện tại

- Hồn thú: GLB `hon_3d/`
- Non-spirit: Brackeys slice (`explosion` / `slash_seq` / `fire_point` / `water_wave` / …) + Stylized overlay + forge fallback
