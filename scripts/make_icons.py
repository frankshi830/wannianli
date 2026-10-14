#!/usr/bin/env python3
"""生成万年历 PWA 图标（红底金字「历」），写入 public/ 目录。"""
import os
import urllib.request

from PIL import Image, ImageDraw, ImageFont

FONT_URL = "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Bold.otf"
FONT_PATH = "/tmp/NotoSansSC-Bold.otf"
OUT_DIR = "public"

RED = (157, 41, 51, 255)
GOLD = (201, 162, 75, 255)
CREAM = (245, 230, 200, 255)


def get_font():
    if not os.path.exists(FONT_PATH):
        urllib.request.urlretrieve(FONT_URL, FONT_PATH)
    return FONT_PATH


def base(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * 0.22)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=RED)
    pad = max(2, int(size * 0.055))
    d.rounded_rectangle(
        [pad, pad, size - 1 - pad, size - 1 - pad],
        radius=max(2, r - pad),
        outline=GOLD,
        width=max(1, size // 110),
    )
    return img, ImageDraw.Draw(img)


def draw_icon(size):
    img, d = base(size)
    font = ImageFont.truetype(get_font(), int(size * 0.58))
    bbox = d.textbbox((0, 0), "历", font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1]), "历", font=font, fill=CREAM)
    return img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    draw_icon(512).save(os.path.join(OUT_DIR, "icon-512.png"))
    draw_icon(192).save(os.path.join(OUT_DIR, "icon-192.png"))
    sizes = [16, 32, 48, 64, 128, 256]
    draw_icon(sizes[0]).save(
        os.path.join(OUT_DIR, "icon.ico"),
        sizes=[(s, s) for s in sizes],
        format="ICO",
    )
    print("icons generated")


if __name__ == "__main__":
    main()
