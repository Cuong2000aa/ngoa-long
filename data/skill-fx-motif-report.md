# Skill FX motif / style report
Generated: 2026-10-22 · **590** skills · synced classify → skills.json
## Motif
| Motif | Count | % |
|-------|------:|--:|
| `arcane` | 143 | 24.2 |
| `heal` | 65 | 11.0 |
| `slash` | 48 | 8.1 |
| `buff` | 41 | 6.9 |
| `pierce` | 39 | 6.6 |
| `dragon` | 27 | 4.6 |
| `fire` | 26 | 4.4 |
| `shadow` | 24 | 4.1 |
| `tiger` | 22 | 3.7 |
| `ice` | 20 | 3.4 |
| `poison` | 18 | 3.1 |
| `thunder` | 18 | 3.1 |
| `water` | 17 | 2.9 |
| `shield` | 15 | 2.5 |
| `rush` | 15 | 2.5 |
| `spirit` | 13 | 2.2 |
| `charge` | 12 | 2.0 |
| `bagua` | 12 | 2.0 |
| `whirlwind` | 11 | 1.9 |
| `wolf` | 2 | 0.3 |
| `firebird` | 2 | 0.3 |

## Fx3dStyle (sau resolve)
| Style | Count | % |
|-------|------:|--:|
| `beam` | 143 | 24.2 |
| `bless` | 117 | 19.8 |
| `shadow` | 63 | 10.7 |
| `pierce` | 38 | 6.4 |
| `nova` | 28 | 4.7 |
| `breath` | 27 | 4.6 |
| `roar` | 23 | 3.9 |
| `charge` | 21 | 3.6 |
| `ice` | 19 | 3.2 |
| `poison` | 18 | 3.1 |
| `thunder` | 17 | 2.9 |
| `barrier` | 15 | 2.5 |
| `rush` | 15 | 2.5 |
| `tide` | 13 | 2.2 |
| `bagua` | 12 | 2.0 |
| `whirl` | 11 | 1.9 |
| `slash` | 10 | 1.7 |

## Preview 1 skill / bucket
| Bucket | id |
|--------|----|
| beam / arcane | `yen_nguyet` |
| thunder | `sam_set` |
| bagua | `bat_tran_do` |
| ice | `bang_chuy` |
| spirit | `tran_hon` |
| breath / dragon | `long_dam` |
| pierce | `bach_bo` |
| nova / firebird | `loan_hoi_phuong_vu` |
| slash | `basic_strike` |
| bless | `nhan_duc` |

## Phase C — pattern variants
Cùng `Fx3dStyle` / motif — **không** thêm motif. `patternVariant` trong `stylePlay.ts` đổi scale path, trail, ground mark, shockwave; `emitHostileProjectile3d` nhận `pattern` (arc / density / size).

### Beam (motif `arcane` ≈ 24%) theo pattern
| Pattern | n (arcane) | Skill mẫu | Nhìn nhanh |
|---------|----------:|-----------|------------|
| `single` | 48 | `yen_nguyet` | 1 path, impact 1 điểm |
| `column` | 33 | `bao_hao` | trail cao / multi dọc |
| `row` | 13 | `hoanh_hoa` | quét ngang 2 vệt lệch |
| `all` | 49 | `than_toan` | ground + shock rộng (AoE) |

### Beam flash tint (cùng style)
| Flash | Sheet bolt chính | Tint |
|-------|------------------|------|
| `blue` / cyan | `codemanu/anima` | `#38bdf8` |
| `purple` | `superpowers/sp_magic` | `#a78bfa` |
| `violet` | `codemanu/constellation` | `#c4b5fd` |

*(Catalog hiện tại: toàn arcane dùng `flash: blue` — nhánh purple/violet sẵn cho data / preview.)*

### Style → path asset chính (QA mắt ~0.5s)
| Style | Path / pack chính | Ghi chú |
|-------|-------------------|---------|
| `beam` | anima / sp_magic + constellation | pattern + flash tint |
| `thunder` | `hon_loi` qi + storm_burst | ≠ beam tím |
| `bagua` | `hon_bagua` + elden_ring sigil | vòng / strike |
| `ice` | `hon_thuy` + water_wave frost | ≠ arcane |
| `pierce` | stylized/arrow + trail mỏng | ≠ rush |
| `slash` | slash classic 24f + sparks | pattern trails |
| `breath` | `hon_rong` qi_fire | |
| `shadow` | vortex + shadow_burst | spirit offensive |
| `nova` | pixel_fire / explosion | firebird |
| `bless` | elden_ring + sp_heal | không slash |
| `barrier` | ward_barrier | shield |
| `charge` / `rush` | muzzle + earth trail | giữ choreography |
| `poison` / `tide` / `whirl` / `roar` | worm / water_wave / vortex / sp_shock | hon khi có pack |

### Checklist preview
Mở `preview-skill-3d.html` (dev: `npm run dev` → `/preview-skill-3d.html`). Bấm QA chips theo thứ tự beam → thunder → bagua → ice → pierce → slash → bless: mỗi cặp phải khác trong ~0.5s. Thêm `beam·col` / `beam·row` / `beam·all` để so pattern.
