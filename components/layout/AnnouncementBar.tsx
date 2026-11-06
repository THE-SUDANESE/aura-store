/**
 * شريط إعلانات علوي — رسالة واحدة واضحة (شحن مجاني + فترة الإرجاع).
 * ثابت في الأعلى لأنه أرخص مكان لتحسين التحويل في متجر جديد.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-ink-900 text-sand-50">
      <div className="shell flex h-9 items-center justify-center gap-3 text-center text-[11px] sm:text-xs">
        <span className="hidden sm:inline text-sand-300">AURA</span>
        <span className="hidden sm:inline text-ink-500">|</span>
        <p className="tracking-wide">
          شحن مجاني للطلبات فوق ٣٠٠ ر.س — وإرجاع خلال ١٤ يوماً
        </p>
      </div>
    </div>
  );
}
