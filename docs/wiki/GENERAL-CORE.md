# Võ tướng — việc đã làm / chi tiết từng mục

> Phạm vi: **core tướng** (không làm hệ phụ: tướng khí, mệnh cách, ấn, trang bị, chiến kỳ…).  
> Nguồn: [Ngọa Long Wiki — Võ tướng](https://ngoalong.vnggames.com/ngoa-long-wiki) + CDN `hero/{id}.json`.

---

## 1. Chỉ số + chiêu theo phẩm

| Chi tiết | Trạng thái |
|----------|------------|
| Data `statsByQuality` / `growthRatesByQuality` / `skillsByQuality` | ✅ 373 tướng wiki |
| `NLDatabase.scaleGeneral` lấy base theo **phẩm hiện tại** | ✅ |
| `resolveSkillId` chọn chiêu đúng tab phẩm wiki | ✅ |
| Huấn luyện (`trainGeneral`) rescale + cập nhật `skillId` | ✅ |
| `syncLegacyView` đồng bộ skill theo phẩm mỗi lần render | ✅ |

**Cách kiểm:** Kho tướng → xem dòng «Chiêu: …» đổi sau giác ngộ; stats đổi theo phẩm.

---

## 2. Giác ngộ phẩm

| Chi tiết | Trạng thái |
|----------|------------|
| Data `awakenByQuality` (cost nguyên liệu wiki) | ✅ |
| `NLDatabase.awakenInfo(from → to)` | ✅ |
| `NLGame.awakenGeneral` trừ inventory + lên phẩm + rescale | ✅ |
| Nút **Giác ngộ** trên card tướng (tooltip cost) | ✅ |
| Không vượt `wikiMaxQuality` | ✅ |

**Cách kiểm:** Cho inventory đủ `mat_*` (Tuyết Liên…) → bấm Giác ngộ → phẩm + chiêu + chỉ số đổi.

---

## 3. Portrait wiki

| Chi tiết | Trạng thái |
|----------|------------|
| CDN: `…/icons/{img}` (HTTP 200) | ✅ |
| Field `portrait` + `portraitUrl` trên `generals.json` | ✅ (sync script) |
| UI kho / tửu quán dùng portrait, fallback sprite binh | ✅ `onerror` |

**Script:** `python3 scripts/sync-wiki-general-core.py` (ghi portrait từ `hero.img`).

---

## 4. Binh chủng từ wiki `units`

| Chi tiết | Trạng thái |
|----------|------------|
| Map 枪兵→spear, 骑兵→cavalry, 步兵→infantry, 弓兵→archer, 谋士/文官→strategist | ✅ |
| `troop` + `troop2` (đổi binh trên đội hình) | ✅ đã có từ sync |
| `wikiUnits` raw lưu trên general | ✅ |
| Wiki thiếu `units` (~256) → giữ infantry | OK |

---

## 5. Effects từ mô tả chiêu

| Chi tiết | Trạng thái |
|----------|------------|
| Parse `[Thiết Bích]` / `[Trúng Độc]`… → `effects[]` | ✅ |
| Engine apply + icon đầu bền | ✅ |
| Bổ sung NAME_MAP (Phá Thánh, Bát Quái, Ngủ Say…) | ✅ |
| Rebuild `nl-db.bundle.js` sau sync | ✅ |

## 6. Icon hiệu ứng wiki (hieu-ung)

| Chi tiết | Trạng thái |
|----------|------------|
| Tải 172 icon → `assets/ui/status/` | ✅ |
| `iconLocal` trong `status-effects.json` | ✅ |
| Hiện cạnh thanh máu góc (panel ĐỊCH/QUÂN TA) | ✅ |
| Marker 3D trên đầu: dùng icon wiki **mờ** (~55%) | ✅ |

```bash
python3 scripts/sync-skill-effects-from-desc.py
python3 scripts/sync-wiki-general-core.py
python3 scripts/rebuild-bundle-utf8.py
```

---

## Không làm (hệ phụ — theo yêu cầu)

- Tướng khí / vũ khí (`viWeapon`)
- Mệnh cách / tri kỷ (`kismet`, `bonds`)
- Ấn kế thừa (`seal`)
- Trang bị / chiến kỳ / binh thư / phó bản wiki

---

## File đụng tới

- `js/db/database.js` — scale / awakenInfo / portraitUrl  
- `js/game.js` — `awakenGeneral`  
- `js/city/player-state.js` — sync skill + canAwaken  
- `js/ui.js` / `js/app.js` — nút Giác ngộ + art  
- `js/recruit/recruit-system.js` — portrait tửu quán  
- `scripts/sync-wiki-general-core.py` — portrait + wikiUnits  
- `scripts/sync-skill-effects-from-desc.py` — effects từ desc  
