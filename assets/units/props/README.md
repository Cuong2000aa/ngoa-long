# Props 3D — binh chủng

Battle dùng **modular procedural** (`troopKit`) + **GLB lớp C** nếu file có mặt.

## File hiện có (generated / CC0)

| File | Vai trò |
|------|---------|
| `spear.glb` | Thương / kích |
| `sword.glb` | Đao bộ binh |
| `bow.glb` | Cung |
| `shield.glb` | Khiên |
| `staff.glb` | Trượng mưu |
| `horse.glb` | Ngựa kỵ |
| `helm_t5.glb` | Mũ bậc ≥5 |
| `armor_t5.glb` | Giáp bậc ≥5 |

Sinh lại: `node scripts/gen-battle-props.mjs`

## Nguồn thay thế (CC0)

| File | Gợi ý |
|------|-------|
| weapons | [KayKit Adventurers](https://kaylousberg.itch.io/kaykit-adventurers) CC0 |
| sword | [Chinese Sword Pack](https://vvaytoyek.itch.io/chinese-sword-pack-1-free) CC0 |
| spear/bow | [Quaternius](https://quaternius.com/) CC0 |

License phải **CC0** hoặc RF commercial. Không commit pack trả phí.
Thay file cùng tên → `propLoader` tự dùng (fallback procedural nếu 404).
