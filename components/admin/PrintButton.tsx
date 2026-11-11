"use client";

/** زر الطباعة — يعمل في المتصفح فقط، ولذلك في مكوّن عميل منفصل. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink-900 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-ink-800 print:hidden"
    >
      طباعة الفاتورة
    </button>
  );
}
