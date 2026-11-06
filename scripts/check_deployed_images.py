"""
يفحص صور المنتجات على الموقع المنشور ويخبرك أين وصلت الملفات فعلاً.

الاستخدام:
    python scripts/check_deployed_images.py https://aura-store.vercel.app
    python scripts/check_deployed_images.py https://aura-store.vercel.app --list

لماذا؟ إذا أعادت كل الصور 404 فهذا يعني أن مجلد public لم يصل إلى النشر
بالشكل المتوقع (مثلاً رُفع داخل مجلد متداخل عبر واجهة GitHub). السكربت
يجرّب المسارات المتداخلة الشائعة ويطبع أي صيغة تعمل، فتعرف مباشرة
أين ذهبت الملفات وكيف تصحّحها.
"""

from __future__ import annotations

import argparse
import pathlib
import sys
import urllib.error
import urllib.request

PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
REAL_DIR = PROJECT_ROOT / "public" / "products" / "real"
TIMEOUT = 20


def local_urls() -> list[str]:
    """مسارات الصور كما هي في المجلد المحلي (public/products/real)."""
    if not REAL_DIR.is_dir():
        return []
    return [f"/products/real/{p.name}" for p in sorted(REAL_DIR.iterdir()) if p.is_file()]


def status(url: str) -> int | str:
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "aura-image-check"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return resp.status
    except urllib.error.HTTPError as exc:
        return exc.code
    except Exception as exc:  # noqa: BLE001 - نريد فقط سبباً مقروءاً
        return exc.__class__.__name__


def probe_nested(base: str, sample: str) -> list[tuple[str, int | str]]:
    """يجرّب الصيغ المتداخلة الشائعة لصورة واحدة."""
    name = sample.rsplit("/", 1)[-1]
    candidates = [
        f"/products/real/{name}",
        f"/products/real/products/real/{name}",
        f"/public/products/real/{name}",
        f"/products/real/public/products/real/{name}",
        f"/public/public/products/real/{name}",
        f"/products/products/real/{name}",
        f"/products/real/real/{name}",
        f"/real/{name}",
        f"/images/products/real/{name}",
        f"/products/{name}",
        f"/{name}",
    ]
    out: list[tuple[str, int | str]] = []
    for path in candidates:
        out.append((path, status(base.rstrip("/") + path)))
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", help="عنوان الموقع المنشور، مثل https://aura.vercel.app")
    parser.add_argument("--list", action="store_true", help="اطبع المسارات المتوقعة فقط دون فحص")
    parser.add_argument("--limit", type=int, default=0, help="افحص أول N صورة فقط")
    args = parser.parse_args()

    urls = local_urls()
    if not urls:
        print(f"لم أجد ملفات في {REAL_DIR}", file=sys.stderr)
        return 2

    if args.list:
        print(f"{len(urls)} صورة متوقعة على المسارات التالية:")
        for url in urls:
            print(f"  public{url}")
        return 0

    base = args.site.strip()
    targets = urls[: args.limit] if args.limit > 0 else urls

    print(f"أفحص {len(targets)} صورة على {base} ...\n")
    ok, failed = [], []
    for url in targets:
        code = status(base.rstrip("/") + url)
        (ok if code == 200 else failed).append((url, code))

    print(f"✅ تعمل: {len(ok)}")
    print(f"❌ لا تعمل: {len(failed)}")

    if failed:
        print("\nأمثلة فاشلة:")
        for url, code in failed[:5]:
            print(f"  {code}  {url}")

        sample = failed[0][0]
        print(f"\nأين وصلت الملفات فعلاً؟ أجرّب صيغاً متداخلة للصورة {sample}:")
        for path, code in probe_nested(base, sample):
            mark = "✅" if code == 200 else "  "
            print(f"  {mark} {code}  {path}")

        winner = next((p for p, c in probe_nested(base, sample) if c == 200), None)
        print()
        if winner:
            print(f"الملفات موجودة على: {winner}")
            print("راجع مستودع GitHub لتطابق المسارات (المجلد يجب أن يكون public/products/real مباشرة).")
        else:
            print("لا صيغة تعمل: الملفات ليست في النشر إطلاقاً.")
            print("تحقق من: الفرع الذي ينشره Vercel، وأن آخر نشر تم بعد رفع الصور،")
            print("وأن مجلد public/products/real موجود في المستودع (وليس داخل مجلد آخر).")

    return 0 if not failed else 1


if __name__ == "__main__":
    raise SystemExit(main())
