"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, shippingRulesOf, type SiteSettings } from "@/lib/types/settings";

/**
 * الإعدادات تُقرأ مرة واحدة في app/layout.tsx (خادم) وتُمرَّر هنا،
 * فلا تحتاج أي مكوّن عميل استدعاء API أو قاعدة بيانات لمعرفة الشحن أو الضريبة.
 */
const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: ReactNode;
}) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return useContext(SettingsContext);
}

/** قواعد التسعير الجاهزة للحساب (شحن/حد شحن/نسبة ضريبة). */
export function usePricingRules() {
  return shippingRulesOf(useSiteSettings());
}
