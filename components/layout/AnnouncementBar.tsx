/**
 * شريط إعلانات علوي — نصه من إعدادات الموقع (/admin/settings).
 * ثابت في الأعلى لأنه أرخص مكان لتحسين التحويل في متجر جديد.
 */
export function AnnouncementBar({ text, enabled }: { text: string; enabled: boolean }) {
  if (!enabled) return null;

  return (
    <div className="bg-ink-900 text-sand-50">
      <div className="shell flex h-9 items-center justify-center gap-3 text-center text-[11px] sm:text-xs">
        <span className="hidden sm:inline text-sand-300">AURA</span>
        <span className="hidden sm:inline text-ink-500">|</span>
        <p className="tracking-wide">{text}</p>
      </div>
    </div>
  );
}
