# Skill FX motif / style report

Generated: 2026-10-22 · catalog **590** skills · missing motif/flash: **0**

## Motif (>8% đậm)

| Motif | Count | % |
|-------|------:|--:|
| `arcane` | 155 | 26.3 |
| `heal` | 70 | 11.9 |
| `slash` | 48 | 8.1 |

## Fx3dStyle trước → sau (tách bucket)

| Style | Trước | Sau | Ghi chú |
|-------|------:|----:|---------|
| `beam` | 184 | 155 | −29 (thunder+bagua) |
| `bless` | 123 | 123 |  |
| `shadow` | 53 | 53 |  |
| `pierce` | 0 | 40 | mới ← rush |
| `breath` | 33 | 33 |  |
| `nova` | 25 | 25 |  |
| `roar` | 22 | 22 |  |
| `charge` | 21 | 21 |  |
| `poison` | 20 | 20 |  |
| `tide` | 16 | 16 |  |
| `rush` | 55 | 15 | −40 (pierce) |
| `bagua` | 0 | 15 | mới ← beam |
| `whirl` | 14 | 14 |  |
| `barrier` | 14 | 14 |  |
| `thunder` | 0 | 14 | mới ← beam |
| `slash` | 10 | 10 |  |

## Preview test (gallery / trận)

| Bucket | Skill id |
|--------|----------|
| thunder | `sam_set`, `than_loi` |
| bagua | `khong_thanh`, `bat_tran_do` |
| pierce | `bach_bo`, `lac_nhat_than_tien` |
| beam (arcane) | `yen_nguyet`, `binh_phat` |
| rush | xem `previewTestIds.rush` trong JSON |

## File đụng

- `src/battle/fx3d/resolveStyle.ts` — style mới + thứ tự map
- `src/battle/fx3d/stylePlay.ts` — emission/impact pierce/thunder/bagua
- `src/battle/battleVfx3d.ts` — premium layers / bolt / flight
- `src/battle/battleVfx.ts` — fallback pierce
- `data/skill-fx-groups.json` — regenerate
- `data/skill-fx-motif-report.json` — report này

Không sửa `skills.json` (motif/flash đã đúng). Không thêm motif hàng loạt.
