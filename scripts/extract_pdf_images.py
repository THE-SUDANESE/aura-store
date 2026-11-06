"""
استخراج صور المنتجات من ملف PDF وتحسينها لملفات المتجر.

الاستخدام:
    python scripts/extract_pdf_images.py --pdf "واتساب.pdf"

المخرجات:
    public/products/real/aura-sun-01.jpg ...  (بعرض 760px، JPEG)
    scripts/extracted-images.json            (تقرير: الصفحة → اسم الملف + ألوان تقديرية)

لا يحتاج أي مكتبة خارج PyMuPDF و Pillow:
    python -m pip install pymupdf pillow
"""

from __future__ import annotations

import argparse
import colorsys
import json
import pathlib
import sys

import pymupdf
from PIL import Image

OUT_DIR = pathlib.Path("public/products/real")
REPORT = pathlib.Path("scripts/extracted-images.json")

MAX_WIDTH = 760
JPEG_QUALITY = 82


def dominant_colors(img: Image.Image) -> dict:
    """
    يستخرج لون العدسة ولون الإطار من صورة المنتج.

    الصور منتجات على خلفية بيضاء/رمادية باهتة، فالبكسلات الملوّنة أو الداكنة
    هي النظارة نفسها. نقسم الصورة أفقياً: الصفوف الوسطى تحوي العدسات،
    والمنطقة اليمنى/اليسرى تحوي الأذرع المعدنية.
    """
    small = img.convert("RGB").resize((160, 213))
    w, h = small.size
    pixels = small.load()

    lens_px: list[tuple[float, float, float]] = []
    frame_px: list[tuple[float, float, float]] = []

    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            hh, ll, ss = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            # تجاهل الخلفية: بيضاء أو رمادية بلا تشبّع
            is_colored = ss > 0.22 and 0.12 < ll < 0.90
            is_dark = ll < 0.22
            if not (is_colored or is_dark):
                continue
            if 0.30 * h <= y <= 0.72 * h and 0.15 * w <= x <= 0.85 * w:
                lens_px.append((hh, ss, ll))
            elif (x < 0.14 * w or x > 0.86 * w) and 0.35 * h <= y <= 0.75 * h:
                frame_px.append((hh, ss, ll))

    def summarize(samples, fallback_hue=0.0):
        if not samples:
            return {"hue": fallback_hue, "sat": 0.0, "light": 0.35, "count": 0}
        # المتوسط الدائري للـ hue (تجنّب القفزة عند الأحمر)
        import math

        sx = sum(math.cos(s[0] * 2 * math.pi) * (s[1] + 0.05) for s in samples)
        sy = sum(math.sin(s[0] * 2 * math.pi) * (s[1] + 0.05) for s in samples)
        hue = (math.atan2(sy, sx) / (2 * math.pi)) % 1.0
        return {
            "hue": round(hue, 3),
            "sat": round(sum(s[1] for s in samples) / len(samples), 3),
            "light": round(sum(s[2] for s in samples) / len(samples), 3),
            "count": len(samples),
        }

    return {"lens": summarize(lens_px), "frame": summarize(frame_px)}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", help="مسار ملف PDF (افتراضياً أول ملف pdf في المجلد)")
    parser.add_argument("--prefix", default="aura-sun")
    args = parser.parse_args()

    pdf_path = pathlib.Path(args.pdf) if args.pdf else next(pathlib.Path(".").glob("*.pdf"))
    if not pdf_path.exists():
        print(f"لم أجد الملف: {pdf_path}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)
    report = []

    for index, page in enumerate(doc):
        images = page.get_images(full=True)
        if not images:
            continue
        # الصورة الأصلية المدمجة (أفضل جودة من إعادة تصيير الصفحة)
        info = images[0]
        raw = doc.extract_image(info[0])
        img = Image.open(__import__("io").BytesIO(raw["image"]))
        img = img.convert("RGB")

        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            img = img.resize((MAX_WIDTH, round(img.height * ratio)), Image.LANCZOS)

        name = f"{args.prefix}-{index + 1:02d}.jpg"
        path = OUT_DIR / name
        img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)

        colors = dominant_colors(img)
        report.append(
            {
                "page": index + 1,
                "file": name,
                "url": f"/products/real/{name}",
                "bytes": path.stat().st_size,
                "colors": colors,
            }
        )

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    total_bytes = sum(item["bytes"] for item in report)
    print(f"استُخرجت {len(report)} صورة إلى {OUT_DIR}")
    print(f"الحجم الإجمالي: {total_bytes / 1024 / 1024:.1f} ميغابايت")
    print(f"التقرير: {REPORT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
