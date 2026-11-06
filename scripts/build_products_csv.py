"""
يبني ملف المنتجات القابل للتعديل docs/products-import.csv من صور PDF المستخرجة.

لكل صورة منتج واحد + متغير واحد + صورة أساسية. ألوان العدسة تُقدَّر من
البكسلات ثم تُصحَّح يدوياً في OVERRIDES (بعد مراجعة الصور).

الاستخدام:
    python scripts/build_products_csv.py
"""

from __future__ import annotations

import colorsys
import csv
import math
import pathlib
import statistics

from PIL import Image

IMAGES_DIR = pathlib.Path("public/products/real")
CSV_PATH = pathlib.Path("docs/products-import.csv")

# ---------------------------------------------------------------------------
# لون العدسة: أزرق، بنفسجي، أحمر، بني، عسلي، أصفر، أخضر، رمادي، أسود
# القيم الافتراضية تُستخرج من الصورة، وOVERRIDES تصحّح ما أخطأ فيه الاستخراج
# (راجعتها بصرياً صورة بصورة).
# ---------------------------------------------------------------------------
OVERRIDES: dict[int, str] = {
    3: "purple", 4: "purple", 5: "grey", 7: "grey", 8: "grey", 10: "grey",
    16: "black", 17: "black", 20: "grey", 21: "black", 23: "grey", 31: "purple",
    37: "black", 38: "purple", 40: "grey", 41: "purple", 43: "black", 50: "purple",
    51: "black", 52: "black", 53: "grey", 57: "black", 58: "black", 63: "black",
    66: "green", 68: "black", 74: "black", 76: "black", 79: "amber", 81: "black",
    35: "grey",
}

TINT_AR = {
    "blue": "أزرق متدرج",
    "purple": "بنفسجي متدرج",
    "red": "أحمر داكن",
    "brown": "بني دافئ",
    "amber": "عسلي",
    "yellow": "أصفر",
    "green": "أخضر فاتح",
    "grey": "رمادي متدرج",
    "smoke": "دخاني",
    "black": "أسود",
}

TINT_EN = {
    "blue": "Blue Gradient",
    "purple": "Purple Gradient",
    "red": "Deep Red",
    "brown": "Warm Brown",
    "amber": "Amber",
    "yellow": "Yellow",
    "green": "Light Green",
    "grey": "Grey Gradient",
    "smoke": "Smoke",
    "black": "Black",
}

DEFAULT_PRICE = "299.00"
DEFAULT_STOCK = "10"


def detect_tint(path: pathlib.Path) -> str:
    """يقدّر لون العدسة من البكسلات الملوّنة في وسط الصورة."""
    img = Image.open(path).convert("RGB").resize((200, 267))
    w, h = img.size
    px = img.load()
    samples = []
    for y in range(int(0.28 * h), int(0.74 * h)):
        for x in range(int(0.13 * w), int(0.87 * w)):
            r, g, b = px[x, y]
            hue, light, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if sat > 0.18 and 0.10 < light < 0.96:
                samples.append((light, hue, sat))

    if len(samples) < 40:
        return "black"

    sx = sum(math.cos(s[1] * 2 * math.pi) * s[2] for s in samples)
    sy = sum(math.sin(s[1] * 2 * math.pi) * s[2] for s in samples)
    hue = (math.atan2(sy, sx) / (2 * math.pi)) % 1.0
    sat = statistics.mean(s[2] for s in samples)

    if sat < 0.20:
        return "grey"
    if hue < 0.045 or hue >= 0.93:
        return "red"
    if hue < 0.09:
        return "brown"
    if hue < 0.15:
        return "amber"
    if hue < 0.20:
        return "yellow"
    if hue < 0.45:
        return "green"
    if hue < 0.54:
        return "blue"
    if hue < 0.66:
        return "blue"
    if hue < 0.80:
        return "purple"
    return "red"


def build_row(page: int, path: pathlib.Path) -> dict[str, str]:
    tint_key = OVERRIDES.get(page) or detect_tint(path)
    tint_ar = TINT_AR[tint_key]
    tint_en = TINT_EN[tint_key]
    number = f"{page:02d}"

    return {
        "slug": f"aura-sun-{number}",
        "name_ar": f"AURA SUN {number} — {tint_ar}",
        "name_en": f"AURA Sun {number} — {tint_en}",
        "price": DEFAULT_PRICE,
        "compare_at": "",
        "stock": DEFAULT_STOCK,
        "color_ar": tint_ar,
        "color_en": tint_en,
        "image": f"/products/real/{path.name}",
        "description": (
            f"نظارة شمسية بإطار معدني خفيف وعدسة {tint_ar}، "
            "تحجب الأشعة فوق البنفسجية بالكامل وتقلل الوهج دون تغيير الألوان."
        ),
        "status": "active",
        "featured": "false",
    }


def main() -> int:
    files = sorted(IMAGES_DIR.glob("aura-sun-*.jpg"))
    if not files:
        print("لا توجد صور. شغّل scripts/extract_pdf_images.py أولاً.")
        return 1

    rows = [build_row(int(p.stem.split("-")[-1]), p) for p in files]

    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    # utf-8-sig حتى يفتح Excel العربية بشكل صحيح
    with CSV_PATH.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    counts: dict[str, int] = {}
    for row in rows:
        counts[row["color_ar"]] = counts.get(row["color_ar"], 0) + 1

    print(f"كُتب {len(rows)} منتجاً في {CSV_PATH}")
    for color, count in sorted(counts.items(), key=lambda item: -item[1]):
        print(f"  {color}: {count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
