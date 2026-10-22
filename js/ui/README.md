# NLUI modules (P0)

Script thường (không ES module) — gắn `window.NLUIParts` rồi facade `js/ui.js` → `window.NLUI`.

| File | Nội dung |
|------|----------|
| `shared.js` | fmt, toast, panel, form helpers |
| `city.js` | resources, dock, building detail |
| `generals.js` | tướng / quán / luyện |
| `world.js` | thế giới, tháp, lôi đài |
| `equip.js` | trang bị |
| `formation.js` | bày trận |
| `campaign.js` | phó bản |

Thứ tự load: xem `index.html`.
