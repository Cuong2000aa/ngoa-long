# Phân cấp chiêu → VFX (590) — revised

Nguồn tay chỉnh: `skill-fx-classify-revised.csv` → `data/skill-fx-classify.csv`.

| Cột | Ý nghĩa |
|-----|---------|
| **Tên** | Tên chiêu |
| **Loại** | sát thương / buff / debuff / giáp / độc / … |
| **Hệ màu** | Palette |
| **Kiểu FX** | hồn thú / băng / lôi / linh hồn / trận pháp… |

### Phân biệt hồn

| Tag | Nghĩa VFX | Ví dụ |
|-----|-----------|--------|
| **`linh hồn`** / `linh hồn\|triệu hồi` | **Hồn người** xuất hiện (silhouet / linh ảnh nhân vật), không phải thú | Hiệu Lệnh, Thiên Mệnh, Trấn Hồn, Tỏa Hồn… |
| **`hồn_rồng` / `hồn_hổ` / …** | **Hồn thú** — GLB `hon_3d/` bay | Hỏa Long, Hổ Khiếu, Độc Xà… |

Hệ màu `Linh hồn · tím` = palette tím cho hồn người (khác Huyền/bát quái).

File: [`data/skill-fx-classify.csv`](../../data/skill-fx-classify.csv) · [`data/skill-fx-classify.json`](../../data/skill-fx-classify.json)

## Thống kê loại

| Loại | Số |
|------|---:|
| sát thương | 137 |
| sát thương+buff | 134 |
| buff | 38 |
| sát thương+buff+trị liệu | 31 |
| sát thương+buff+debuff | 26 |
| sát thương+khống chế | 19 |
| sát thương+buff+khống chế | 14 |
| sát thương+buff+debuff+khống chế | 13 |
| sát thương+debuff+câm lặng | 13 |
| sát thương+trị liệu | 12 |
| buff+giáp+trị liệu | 11 |
| sát thương+buff+giáp | 11 |
| sát thương+buff+debuff+giáp | 11 |
| sát thương+buff+giáp+trị liệu | 11 |
| sát thương+buff+debuff+câm lặng | 10 |
| sát thương+độc | 9 |
| sát thương+debuff | 8 |
| sát thương+buff+thiêu | 7 |
| sát thương+giáp | 6 |
| sát thương+debuff+trị liệu | 6 |
| sát thương+giáp+trị liệu | 6 |
| buff+giáp | 5 |
| buff+trị liệu | 5 |
| sát thương+thiêu | 5 |
| giáp | 3 |
| sát thương+buff+debuff+độc | 3 |
| sát thương+debuff+giáp+trị liệu | 3 |
| debuff | 3 |
| sát thương+buff+độc+khống chế | 3 |
| sát thương+buff+debuff+giáp+câm lặng | 3 |
| sát thương+buff+debuff+giáp+trị liệu+khống chế | 2 |
| sát thương+giáp+độc+khống chế | 2 |
| buff+debuff+trị liệu | 2 |
| sát thương+độc+khống chế | 2 |
| buff+debuff+khống chế | 2 |
| sát thương+debuff+thiêu+trị liệu+câm lặng | 1 |
| sát thương+buff+debuff+thiêu | 1 |
| sát thương+buff+trị liệu+khống chế | 1 |
| debuff+trị liệu | 1 |
| sát thương+buff+debuff+trị liệu | 1 |
| buff+debuff | 1 |
| sát thương+giáp+khống chế | 1 |
| buff+debuff+giáp+câm lặng | 1 |
| sát thương+buff+debuff+trị liệu+khống chế | 1 |
| buff+khống chế | 1 |
| sát thương+debuff+giáp | 1 |
| trị liệu | 1 |
| sát thương+debuff+độc | 1 |
| sát thương+buff+debuff+độc+câm lặng | 1 |

## Thống kê hệ màu

| Hệ màu | Số |
|--------|---:|
| Mưu · lam | 155 |
| Kim khí · vàng | 136 |
| Hỏa · đỏ-cam | 58 |
| Huyết · son | 54 |
| Kim/Thép · bạc | 28 |
| Thổ · nâu | 21 |
| Hổ · vàng hổ | 21 |
| Thủy · lam | 21 |
| Độc · lục | 20 |
| Huyền · tím | 15 |
| Xung · thép | 15 |
| Khiên · vàng | 14 |
| Phong · cyan | 14 |
| Lôi · vàng tím | 14 |
| Linh hồn · tím | 2 |
| Sói · bạc xám | 2 |

## Thống kê kiểu FX (gốc)

| Kiểu FX | Số |
|---------|---:|
| `mưu` | 143 |
| `aura_buff` | 113 |
| `người_chém` | 48 |
| `người_đâm` | 37 |
| `hỏa` | 26 |
| `bóng_ám` | 23 |
| `hồn_rồng` | 21 |
| `băng` | 20 |
| `mãnh thú` | 19 |
| `lôi điện` | 18 |
| `xung_kích` | 15 |
| `độc` | 14 |
| `khiên` | 13 |
| `linh hồn` | 13 |
| `kỵ_xung` | 11 |
| `hồn_phong` | 10 |
| `hồn_thủy` | 9 |
| `bát_quái` | 8 |
| `long` | 6 |
| `trận pháp` | 4 |
| `hồn_xà` | 4 |
| `thủy` | 4 |
| `hồn_hổ` | 3 |
| `hồn_sói` | 2 |
| `linh thú` | 2 |
| `hộ thuẫn` | 2 |
| `phong` | 1 |
| `trị liệu` | 1 |

## Thống kê kiểu FX (đầy đủ)

| Kiểu FX | Số |
|---------|---:|
| `aura_buff` | 113 |
| `mưu|aoe` | 49 |
| `mưu|đơn` | 48 |
| `mưu|cột` | 33 |
| `hỏa|thiêu đốt` | 26 |
| `băng|đóng băng` | 20 |
| `mãnh thú|hổ` | 19 |
| `lôi điện` | 18 |
| `người_chém|aoe` | 18 |
| `xung_kích` | 15 |
| `người_chém|đơn` | 14 |
| `độc|độc vụ` | 14 |
| `mưu|hàng` | 13 |
| `khiên` | 13 |
| `người_chém|cột` | 13 |
| `linh hồn|triệu hồi` | 13 |
| `bóng_ám|đơn` | 13 |
| `người_đâm|aoe` | 12 |
| `kỵ_xung` | 11 |
| `người_đâm|cột` | 10 |
| `người_đâm|hàng` | 10 |
| `hồn_rồng|cột` | 10 |
| `hồn_rồng|aoe` | 8 |
| `long|linh thú` | 6 |
| `hồn_thủy|đơn` | 6 |
| `người_đâm|đơn` | 5 |
| `bát_quái|aoe` | 5 |
| `hồn_phong|cột` | 5 |
| `trận pháp|bát quái` | 4 |
| `bóng_ám|aoe` | 4 |
| `bóng_ám|cột` | 4 |
| `thủy|sóng` | 4 |
| `hồn_xà|hàng` | 3 |
| `người_chém|hàng` | 3 |
| `hồn_phong|đơn` | 3 |
| `hồn_hổ|đơn` | 2 |
| `bóng_ám|hàng` | 2 |
| `hồn_thủy|aoe` | 2 |
| `hồn_sói|cột` | 2 |
| `linh thú|phượng hoàng` | 2 |

## Mẫu (30 chiêu đầu)

| Tên | Loại | Hệ màu | Kiểu FX |
|-----|------|--------|---------|
| Binh Hình Cửu Độn | sát thương+buff | Mưu · lam | `mưu|cột` |
| Binh Phạt | sát thương | Mưu · lam | `mưu|aoe` |
| Binh Tiển | sát thương | Mưu · lam | `mưu|aoe` |
| Binh Vô Thường Hình | sát thương+buff | Mưu · lam | `mưu|cột` |
| Biển Sao Lấp Lánh | sát thương+buff+khống chế | Mưu · lam | `mưu|hàng` |
| Bài Ca Biên Ải | buff+giáp+trị liệu | Khiên · vàng | `khiên` |
| Bài Lãng | sát thương | Mưu · lam | `mưu|aoe` |
| Bài Nhiễu | buff | Kim khí · vàng | `aura_buff` |
| Bào Hao | sát thương | Mưu · lam | `mưu|cột` |
| Bày Trận Như Núi | sát thương+buff+trị liệu | Kim khí · vàng | `aura_buff` |
| Bá Thương | sát thương+buff+giáp | Kim/Thép · bạc | `người_đâm|cột` |
| Bá Vương | sát thương+buff | Mưu · lam | `mưu|aoe` |
| Bá Vương Kích Đỉnh | sát thương+buff | Mưu · lam | `mưu|đơn` |
| Bá Vương Liệt Phách | sát thương+buff | Hỏa · đỏ-cam | `hồn_rồng|aoe` |
| Bá Vương Thần Uy | sát thương+buff | Mưu · lam | `mưu|aoe` |
| Bác Kích | sát thương | Kim/Thép · bạc | `người_đâm|cột` |
| Bác Sát | sát thương+buff | Huyết · son | `người_chém|cột` |
| Bách Bộ Xuyên Dương | sát thương | Kim/Thép · bạc | `người_đâm|đơn` |
| Bách Lý Truy Hồn | sát thương+buff | Kim khí · vàng | `linh hồn|triệu hồi` |
| Bát Quái Trận | sát thương | Huyền · tím | `trận pháp|bát quái` |
| Bát Trận Đồ | sát thương+buff | Huyền · tím | `bát_quái|aoe` |
| Bình Thuật | sát thương+buff+debuff+khống chế | Mưu · lam | `mưu|aoe` |
| Bích Lũy | giáp | Khiên · vàng | `khiên` |
| Bùa Phép Trấn Tà | sát thương+buff+debuff | Mưu · lam | `mưu|aoe` |
| Băng Chùy | sát thương+debuff | Mưu · lam | `băng|đóng băng` |
| Băng Hoại | sát thương+giáp | Mưu · lam | `băng|đóng băng` |
| Băng Phong | sát thương+buff+debuff | Phong · cyan | `băng|đóng băng` |
| Bạch Hồng Quán Nhật | sát thương+buff+debuff+giáp+trị liệu+khống chế | Kim khí · vàng | `linh hồn|triệu hồi` |
| Bạch Kỵ Dương Kỳ | sát thương+buff | Thổ · nâu | `aura_buff` |
| Bạch Long | sát thương+buff | Hỏa · đỏ-cam | `long|linh thú` |
