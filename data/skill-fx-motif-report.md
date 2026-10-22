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

## Cảm giác động (charge → flight → impact)
`hostileTimeline` (`src/battle/fx3d/hostileTimeline.ts`) + `playSkillFx3d` tách 3 pha:
- Charge **120–200ms** tại caster
- Flight **400–700ms** — sprite **bay** from→to (≤3 layer)
- Impact ngắn + residual; `onImpactJuice` optional

| Style | Charge | Flight (bay path) | Impact |
|-------|:------:|:-----------------:|:------:|
| beam / slash / pierce / shadow / nova | yes | yes (bolt+trail) | yes |
| rush / charge | yes | yes (xông/trail) | yes |
| breath / ice / tide / poison / thunder / whirl / roar | yes (hon) | yes (qi-stream) | yes (hon) |
| bagua | yes | ring expand | strike |
| spirit (`hon_hon`) | yes | soul silhouette bay | yes |
| bless | cast+pulse | soft path | pulse |
| barrier | cast+pulse | no | pulse |

### Pack asset (key pose)
| Pack | Stem ≥24 | Key rhythm | Ghi chú |
|------|:--------:|------------|---------|
| `qi_*` (rong/loi/thuy/…) | yes | charge/flight/impact | OK |
| `qi_soul` | yes | flight+impact **đã strengthen** | trước đó gần đứng hình |
| `qi_fire` impact/strike | yes | **đã strengthen** | impact key từng identical |
| `qi_bagua` strike | yes | **đã strengthen** | |

### Checklist preview
```bash
cd "Ngọa Long" && npm run dev
# → /preview-skill-3d.html
```
QA: `yen_nguyet` `bao_hao` `than_toan` `sam_set` `bat_tran_do` `bang_chuy` `bach_bo` `long_dam` `hoa_long` `basic_strike` `nhan_duc` — mỗi chiêu hostile phải thấy **bay/quét**, không chỉ đổi texture tại chỗ.
