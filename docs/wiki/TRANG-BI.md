# Trang bị wiki

- Nguồn: `equip-detail.json` (399 món)
- Icon: `assets/items/wiki/`
- Import: `data/items.json` schema v3

## Slot

- **Giáp** (`armor`): 67
- **Sách / Binh thư** (`book`): 52
- **Áo choàng** (`cloak`): 51
- **Ngựa** (`horse`): 52
- **Thuẫn** (`shield`): 51
- **Dẫn binh** (`troop`): 58
- **Vũ khí** (`weapon`): 68

## Map chỉ số

| Wiki | Remake | Scale |
|------|--------|-------|
| Vật/Pháp Công | vuLuc | /18 |
| Mưu Công | triLuc | /18 |
| Phòng (vật/pháp/mưu) | tongLinh | /18 |
| Lính | hp | ×25 |

```bash
python3 scripts/fetch-wiki-equip.py
python3 scripts/import-wiki-equip.py
python3 scripts/rebuild-bundle-utf8.py
```
