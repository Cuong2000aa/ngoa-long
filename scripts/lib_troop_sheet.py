# -*- coding: utf-8 -*-
"""
lib_troop_sheet.py
==================
Thuật toán phân tích thị giác icon nhân vật & tổng hợp animation vung vũ khí:
- BẢO TỒN NGUYÊN VẸN 100% chi tiết nhân vật: tóc đen tuyền, râu, mắt, viền giáp, tà áo trắng (KHÔNG xóa nhầm r,g,b < 6 hoặc > 250).
- Khóa chặt chân tại mặt đất GROUND_Y = 120 (triệt tiêu 100% hiện tượng "nhúng xuống 2 cái").
- Phân đoạn cơ thể (Upper / Lower Body) qua trục eo waist_y với dải alpha-gradient mượt mà, khử hoàn toàn răng cưa (anti-aliasing).
- VFX vũ khí chuẩn xác theo vị trí vũ khí trên tay nhân vật (quạt ngang ngực, đao vung xéo, thương đâm ngang, cung bắn thẳng).
- Hiệu ứng biến đổi màu theo Bậc (Tier 1-2: hàn băng lam, Tier 3-4: hoàng kim, Tier 5-6: xích lôi / long diễm).
- Hàng 1 chuẩn hóa: Col 0-1,3: Idle tĩnh sắc nét; Col 2: Hit giật lùi thế ngửa người; Col 4-7: Skill vận khí tỏa hào quang dịu mắt, không cháy sáng mất chi tiết.
"""
from __future__ import annotations

import math
from collections import deque
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

CELL = 128
COLS = 8
ROWS = 2
GROUND_Y = 120


def scrub_bg(im: Image.Image) -> Image.Image:
    """
    Chuyển đổi sang RGBA bảo toàn trọn vẹn chi tiết gốc.
    - Với ảnh PNG đã có alpha/transparency: giữ nguyên 100% pixel nhân vật.
    - Với ảnh JPEG đục nền trắng: chỉ xóa nền ngoài rìa qua flood-fill (BFS từ 4 góc),
      tuyệt đối không đục thủng pixel trắng/đen bên trong nhân vật!
    """
    if "transparency" in im.info or im.mode in ("RGBA", "LA"):
        return im.convert("RGBA")

    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    # Kiểm tra 4 góc: nếu đã trong suốt thì không cần flood fill
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    if any(c[3] < 128 for c in corners):
        return im

    # Nếu là ảnh đục nền trắng (như ảnh JPEG từ _poses):
    # Dùng BFS từ 4 góc ngoài rìa, chỉ tẩy vùng nền liên thông với rìa ảnh!
    vis: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
    for s in q:
        vis.add(s)

    while q:
        x, y = q.popleft()
        r, g, b, a = px[x, y]
        if (r + g + b) / 3 > 210:
            px[x, y] = (0, 0, 0, 0)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in vis:
                    vis.add((nx, ny))
                    nr, ng, nb, _ = px[nx, ny]
                    if (nr + ng + nb) / 3 > 190:
                        q.append((nx, ny))

    return im


def normalize_icon(im: Image.Image, cell_size: int = CELL, ground_y: int = GROUND_Y) -> tuple[Image.Image, int, int]:
    """
    Đọc bounding box thực tế của icon, fit vào ô và KHÓA CHẶT CHÂN tại ground_y.
    Bảo toàn sắc nét chi tiết với bộ lọc LANCZOS.
    Trả về: (canvas_128x128, waist_y, pivot_x)
    """
    im = scrub_bg(im)
    w, h = im.size
    # Nếu là sprite strip dọc từ wiki (chiều cao > 1.8 lần chiều rộng) -> lấy chân dung frame đầu
    if h > w * 1.8:
        im = im.crop((0, 0, w, int(w * 1.15)))

    bb = im.getbbox() or (0, 0, w, h)
    im = im.crop(bb)
    bw, bh = im.size

    max_h = ground_y - 14  # ~106px chiều cao tối đa
    max_w = cell_size - 20 # ~108px chiều rộng tối đa
    scale = min(max_w / max(1, bw), max_h / max(1, bh))
    nw, nh = max(1, int(bw * scale)), max(1, int(bh * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (cell_size, cell_size), (0, 0, 0, 0))
    ox = (cell_size - nw) // 2
    oy = ground_y - nh  # CHÂN CHẠM CHUẨN ground_y

    canvas.paste(im, (ox, oy), im)
    waist_y = oy + int(nh * 0.54)
    pivot_x = ox + nw // 2
    return canvas, waist_y, pivot_x


def split_body(base: Image.Image, waist_y: int, cell_size: int = CELL) -> tuple[Image.Image, Image.Image]:
    """
    Tách thân trên (upper) và thân dưới (lower) với dải alpha-gradient mượt mà 12px.
    Khử hoàn toàn vết cắt ngang, răng cưa khi xoay upper body.
    """
    upper = Image.new("RGBA", (cell_size, cell_size), (0, 0, 0, 0))
    lower = Image.new("RGBA", (cell_size, cell_size), (0, 0, 0, 0))
    base_px = base.load()
    up_px = upper.load()
    low_px = lower.load()
    seam = 12

    y_start = waist_y - seam // 2
    y_end = waist_y + seam // 2

    for y in range(cell_size):
        for x in range(cell_size):
            r, g, b, a = base_px[x, y]
            if a == 0:
                continue
            if y < y_start:
                up_px[x, y] = (r, g, b, a)
            elif y > y_end:
                low_px[x, y] = (r, g, b, a)
            else:
                t = (y - y_start) / float(seam)
                # Dải gradient mượt mà: upper mờ dần xuống dưới, lower mờ dần lên trên
                up_a = int(a * (1.0 - t * 0.55))
                low_a = int(a * (0.45 + t * 0.55))
                up_px[x, y] = (r, g, b, up_a)
                low_px[x, y] = (r, g, b, low_a)

    return upper, lower


def shift_image(im: Image.Image, dx: int, dy: int = 0) -> Image.Image:
    """Dịch chuyển pixel trong canvas mà không làm mất alpha channel."""
    if dx == 0 and dy == 0:
        return im
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (dx, dy), im)
    return out


def draw_crescent(canvas: Image.Image, center: tuple[float, float], r_in: float, r_out: float,
                 a_start: float, a_end: float, color: tuple[int, int, int, int], blur_r: float = 1.2) -> None:
    """Vẽ vệt kiếm quang / đường đao hình lưỡi liềm phát quang mượt mà, khử răng cưa."""
    steps = 28
    pts = []
    for i in range(steps + 1):
        t = i / steps
        ang = a_start + t * (a_end - a_start)
        rad = math.radians(ang)
        pts.append((center[0] + r_out * math.cos(rad), center[1] + r_out * math.sin(rad)))
    for i in range(steps, -1, -1):
        t = i / steps
        ang = a_start + t * (a_end - a_start)
        rad = math.radians(ang)
        pts.append((center[0] + r_in * math.cos(rad), center[1] + r_in * math.sin(rad)))

    layer = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(pts, fill=color)
    if blur_r > 0:
        layer = layer.filter(ImageFilter.GaussianBlur(blur_r))
    canvas.alpha_composite(layer)


def draw_star(canvas: Image.Image, cx: float, cy: float, radius: float, color: tuple[int, int, int, int]) -> None:
    """Vẽ tia kiếm khí / hoa lửa sao 4 cánh phát sáng tinh tế."""
    layer = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.line([(cx - radius, cy), (cx + radius, cy)], fill=color, width=2)
    d.line([(cx, cy - radius), (cx, cy + radius)], fill=color, width=2)
    d.line([(cx - radius * 0.6, cy - radius * 0.6), (cx + radius * 0.6, cy + radius * 0.6)], fill=color, width=1)
    d.line([(cx - radius * 0.6, cy + radius * 0.6), (cx + radius * 0.6, cy - radius * 0.6)], fill=color, width=1)
    d.ellipse([(cx - 2, cy - 2), (cx + 2, cy + 2)], fill=(255, 255, 255, 255))
    canvas.alpha_composite(layer)


def tint(im: Image.Image, rgb: tuple[int, int, int], strength: float) -> Image.Image:
    """Phủ màu nhẹ nhàng giữ nguyên độ tương phản và chi tiết nhân vật."""
    overlay = Image.new("RGBA", im.size, (*rgb, int(255 * strength)))
    base = im.copy()
    _, _, _, a = base.split()
    over = Image.blend(base, Image.composite(overlay, base, a), strength)
    over.putalpha(a)
    return over


def hit_frame(base: Image.Image, px: int, ground_y: int = GROUND_Y) -> Image.Image:
    """Frame trúng đòn: giật lùi thế ngửa người -10°, chuyển gam xám và chớp hồng kiếm thương mà không làm mờ đục nét."""
    rot = base.rotate(-10, resample=Image.Resampling.BICUBIC, center=(px, ground_y - 4))
    grey = ImageEnhance.Color(rot).enhance(0.3)
    return tint(grey, (255, 120, 120), 0.22)


def skill_frames(base: Image.Image, px: int, waist_y: int, ground_y: int = GROUND_Y) -> list[Image.Image]:
    """
    Hàng 1 Col 4-7: 4-frame Skill vận khí tỏa hào quang dịu mắt:
    - Nhân vật giữ nguyên độ sắc nét (không brighten quá đà gây cháy sáng / mất mặt / đục lỗ).
    - Hào quang linh khí tụ dưới chân và luân xa tâm đan điền bừng sáng.
    """
    f0 = tint(base, (120, 190, 255), 0.14)
    f1 = tint(base, (255, 210, 80), 0.18)
    f2 = tint(base, (255, 230, 130), 0.22)
    f3 = tint(base, (160, 210, 255), 0.12)

    ring_colors = [
        (80, 170, 255, 140),
        (255, 200, 70, 170),
        (255, 235, 140, 220),
        (120, 190, 255, 110),
    ]

    frames = []
    for i, (fr, r_color) in enumerate(zip([f0, f1, f2, f3], ring_colors)):
        layer = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        rad = 22 + i * 8
        d.ellipse([(px - rad, ground_y - rad // 2), (px + rad, ground_y + rad // 2)], outline=r_color, width=2)
        if i == 2:
            draw_star(layer, px, waist_y - 8, 12, (255, 255, 220, 255))
        fr.alpha_composite(layer)
        frames.append(fr)

    return frames


def get_tier_colors(troop: str, tier: int) -> dict[str, tuple[int, int, int, int]]:
    """Màu sắc vệt chém và hiệu ứng biến đổi theo Bậc (Tier 1-6)."""
    if tier >= 5:
        # Long diễm / Xích lôi huyền thoại
        return {
            "outer": (255, 45, 70, 175),
            "mid": (255, 150, 40, 210),
            "core": (255, 255, 255, 255),
            "star": (255, 220, 120, 255),
        }
    if tier >= 3:
        # Hoàng kim tinh nhuệ
        return {
            "outer": (255, 190, 30, 165),
            "mid": (255, 230, 120, 210),
            "core": (255, 255, 255, 255),
            "star": (255, 245, 180, 255),
        }
    # Tier 1-2: Thép xanh hàn băng cổ điển
    return {
        "outer": (50, 160, 255, 160),
        "mid": (130, 215, 255, 210),
        "core": (255, 255, 255, 255),
        "star": (220, 245, 255, 255),
    }


def add_weapon_vfx_to_frame(vfx: Image.Image, troop: str, fi: int, px: int, waist_y: int, dx: int, tier: int = 1) -> None:
    """
    Vẽ đường đao / thương kình / mũi tên / gió quạt CHUẨN XÁC theo vị trí vũ khí trên tay nhân vật.
    - Không bay lơ lửng trên đầu.
    - Xuất phát đúng từ tay/vũ khí chém/đâm tới phía trước.
    """
    col = get_tier_colors(troop, tier)

    if troop == "infantry":
        # Đao/kiếm: chém vát chéo từ vai xuống đùi phía trước
        center = (px + dx + 10, waist_y - 6)
        if fi == 1:
            draw_star(vfx, px + dx + 12, waist_y - 28, 4, col["mid"])
        elif fi == 2:
            draw_star(vfx, px + dx + 16, waist_y - 34, 5, col["star"])
        elif fi == 3:
            draw_crescent(vfx, center, 22, 36, 130, 230, col["outer"], blur_r=1.8)
            draw_crescent(vfx, center, 27, 31, 135, 225, col["core"], blur_r=0.6)
        elif fi == 4:
            # Nguyệt nha trảm bùng nổ cực đại
            draw_crescent(vfx, center, 28, 50, 120, 240, col["outer"], blur_r=2.2)
            draw_crescent(vfx, center, 36, 44, 125, 235, col["core"], blur_r=0.6)
            draw_star(vfx, px + dx - 40, waist_y + 4, 8, col["star"])
        elif fi == 5:
            draw_crescent(vfx, center, 32, 42, 140, 230, (col["outer"][0], col["outer"][1], col["outer"][2], 80), blur_r=1.8)
            draw_star(vfx, px + dx - 36, waist_y + 10, 4, col["mid"])

    elif troop == "spear":
        # Thương: đâm thẳng ngang tầm ngực về phía trước
        thrust_y = waist_y - 4
        if fi == 1 or fi == 2:
            draw_star(vfx, px + dx - 8, thrust_y, 4, col["mid"])
        elif fi == 3:
            d = ImageDraw.Draw(vfx)
            d.line([(px + dx + 8, thrust_y), (px + dx - 42, thrust_y)], fill=col["outer"], width=5)
            d.line([(px + dx + 8, thrust_y), (px + dx - 46, thrust_y)], fill=col["core"], width=2)
        elif fi == 4:
            # Thương kình phóng thẳng cực mạnh + nón sóng âm
            d = ImageDraw.Draw(vfx)
            d.line([(px + dx + 12, thrust_y), (px + dx - 52, thrust_y)], fill=col["outer"], width=6)
            d.line([(px + dx + 12, thrust_y), (px + dx - 56, thrust_y)], fill=col["core"], width=2)
            pts = [(px + dx - 56, thrust_y), (px + dx - 38, thrust_y - 14), (px + dx - 38, thrust_y + 8)]
            d.polygon(pts, fill=(col["outer"][0], col["outer"][1], col["outer"][2], 120))
            draw_star(vfx, px + dx - 56, thrust_y, 9, col["star"])
        elif fi == 5:
            draw_star(vfx, px + dx - 42, thrust_y, 4, col["mid"])

    elif troop == "cavalry":
        # Kỵ binh: chém từ lưng ngựa càn quét xuống sát mặt đất
        center = (px + dx + 8, waist_y - 4)
        if fi == 2:
            draw_star(vfx, px + dx + 18, waist_y - 36, 5, col["star"])
        elif fi == 3:
            draw_crescent(vfx, center, 28, 44, 130, 235, col["outer"], blur_r=1.8)
            draw_crescent(vfx, center, 34, 40, 135, 230, col["core"], blur_r=0.6)
        elif fi == 4:
            draw_crescent(vfx, center, 32, 56, 120, 245, col["outer"], blur_r=2.2)
            draw_crescent(vfx, center, 42, 50, 125, 240, col["core"], blur_r=0.6)
            d = ImageDraw.Draw(vfx)
            d.ellipse([(px + dx - 50, GROUND_Y - 6), (px + dx - 14, GROUND_Y)], fill=(col["mid"][0], col["mid"][1], col["mid"][2], 120))
            draw_star(vfx, px + dx - 44, GROUND_Y - 4, 7, col["star"])
        elif fi == 5:
            draw_crescent(vfx, center, 36, 48, 140, 235, (col["outer"][0], col["outer"][1], col["outer"][2], 80), blur_r=1.8)

    elif troop == "archer":
        # Cung thủ: mũi tên bắn thẳng ngang ngực
        arrow_y = waist_y - 8
        if fi == 2:
            draw_star(vfx, px + dx - 20, arrow_y, 5, col["star"])
        elif fi == 3:
            d = ImageDraw.Draw(vfx)
            d.line([(px + dx - 14, arrow_y), (px + dx - 48, arrow_y)], fill=col["outer"], width=4)
            d.line([(px + dx - 14, arrow_y), (px + dx - 52, arrow_y)], fill=col["core"], width=2)
            draw_star(vfx, px + dx - 52, arrow_y, 5, col["star"])
        elif fi == 4:
            d = ImageDraw.Draw(vfx)
            d.line([(px + dx - 22, arrow_y), (px + dx - 58, arrow_y)], fill=col["outer"], width=4)
            d.line([(px + dx - 22, arrow_y), (px + dx - 62, arrow_y)], fill=col["core"], width=2)
            d.ellipse([(px + dx - 32, arrow_y - 12), (px + dx - 24, arrow_y - 4)], outline=col["mid"], width=2)
            draw_star(vfx, px + dx - 62, arrow_y, 7, col["star"])
        elif fi == 5:
            draw_star(vfx, px + dx - 44, arrow_y, 3, col["mid"])

    elif troop == "strategist":
        # Mưu sĩ: quạt cầm trước ngực -> quạt phất cuồng phong hình lưỡi liềm bay ra phía trước ngang ngực
        fan_center = (px + dx - 12, waist_y - 6)
        if fi == 1 or fi == 2:
            draw_star(vfx, px + dx - 16, waist_y - 12, 4, col["mid"])
            draw_star(vfx, px + dx - 22, waist_y - 4, 4, col["star"])
        elif fi == 3:
            # Vệt gió nhỏ bắt đầu phóng ra từ quạt
            draw_crescent(vfx, fan_center, 16, 28, 130, 230, col["outer"], blur_r=1.6)
            draw_crescent(vfx, fan_center, 20, 24, 135, 225, col["core"], blur_r=0.6)
        elif fi == 4:
            # Cuồng phong huyền thuật bùng nổ quét thẳng về phía trước
            draw_crescent(vfx, fan_center, 22, 40, 125, 235, col["outer"], blur_r=2.0)
            draw_crescent(vfx, fan_center, 28, 34, 130, 230, col["core"], blur_r=0.6)
            draw_star(vfx, px + dx - 42, waist_y - 6, 8, col["star"])
            draw_star(vfx, px + dx - 32, waist_y + 8, 5, col["mid"])
        elif fi == 5:
            draw_crescent(vfx, fan_center, 26, 36, 140, 225, (col["outer"][0], col["outer"][1], col["outer"][2], 80), blur_r=1.6)
            draw_star(vfx, px + dx - 36, waist_y - 4, 4, col["star"])


def generate_attack_frames(base: Image.Image, troop: str, waist_y: int, px: int, tier: int = 1) -> list[Image.Image]:
    """
    Sinh 8 frame đánh thường:
    - Chân bám chắc mặt đất (grounded, dy = 0).
    - Thân trên xoay góc vung vũ khí quanh trục eo.
    - Dùng alpha_composite mượt mà khử hoàn toàn răng cưa (anti-aliasing).
    """
    upper, lower = split_body(base, waist_y)

    if troop == "spear":
        params = [
            (0.0, 0),
            (-6.0, 2),
            (-14.0, 4),
            (6.0, -8),
            (16.0, -12),
            (8.0, -8),
            (2.0, -3),
            (0.0, 0),
        ]
    elif troop == "cavalry":
        params = [
            (0.0, 0),
            (-8.0, 2),
            (-16.0, 4),
            (10.0, -7),
            (20.0, -11),
            (10.0, -7),
            (3.0, -3),
            (0.0, 0),
        ]
    elif troop == "archer":
        params = [
            (0.0, 0),
            (-8.0, 2),
            (-15.0, 3),
            (4.0, -4),
            (12.0, -6),
            (4.0, -3),
            (1.0, -1),
            (0.0, 0),
        ]
    elif troop == "strategist":
        params = [
            (0.0, 0),
            (-7.0, 1),
            (-13.0, 2),
            (8.0, -5),
            (16.0, -9),
            (8.0, -5),
            (2.0, -2),
            (0.0, 0),
        ]
    else:  # infantry
        params = [
            (0.0, 0),
            (-8.0, 2),
            (-16.0, 4),
            (10.0, -7),
            (20.0, -11),
            (10.0, -7),
            (3.0, -3),
            (0.0, 0),
        ]

    frames = []
    for fi, (ang, dx) in enumerate(params):
        # 1. Thân dưới dịch ngang dx bám chắc mặt đất
        shifted_lower = shift_image(lower, dx, 0)
        # 2. Thân trên xoay mượt BICUBIC quanh trục eo rồi dịch ngang dx
        rot_up = upper.rotate(ang, resample=Image.Resampling.BICUBIC, center=(px, waist_y))
        shifted_upper = shift_image(rot_up, dx, 0)
        # 3. Ghép alpha_composite mượt mà khử hoàn toàn răng cưa tại khớp eo
        fr = Image.alpha_composite(shifted_lower, shifted_upper)

        # 4. Phủ VFX vũ khí
        vfx = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        add_weapon_vfx_to_frame(vfx, troop, fi, px, waist_y, dx, tier)
        fr.alpha_composite(vfx)
        frames.append(fr)

    return frames


def build_sheet_from_icon(icon_input: Path | Image.Image, out_path: Path, troop: str = "infantry", tier: int = 1) -> None:
    """Tạo file sprite sheet 8x2 hoàn chỉnh, sắc nét tối đa từ icon đơn."""
    if isinstance(icon_input, (str, Path)):
        im = Image.open(icon_input)
    else:
        im = icon_input

    base, waist_y, px = normalize_icon(im)
    atk_frames = generate_attack_frames(base, troop, waist_y, px, tier)
    hit_fr = hit_frame(base, px)
    sk_frames = skill_frames(base, px, waist_y)

    # Row 1: Idle (0), Idle (1), Hit (2), Idle (3), Skill (4-7)
    row1 = [base, base, hit_fr, base, sk_frames[0], sk_frames[1], sk_frames[2], sk_frames[3]]

    sheet = Image.new("RGBA", (CELL * COLS, CELL * ROWS), (0, 0, 0, 0))
    for i, fr in enumerate(atk_frames):
        sheet.paste(fr, (i * CELL, 0), fr)
    for i, fr in enumerate(row1):
        sheet.paste(fr, (i * CELL, CELL), fr)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, "PNG", optimize=True)
