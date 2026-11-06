import type { Config } from "tailwindcss";

/**
 * هوية AURA البصرية:
 *  ink      → الأسود الأساسي (النصوص والأسطح الداكنة والأزرار الرئيسية)
 *  accent   → اللون الثانوي الجريء (برتقالي محروق) للنداءات والعروض
 *  warning  → لون التحذيرات (مخزون منخفض، أخطاء الدفع، سياسات)
 *  sand     → أرضية دافئة فاتحة بدل الأبيض الصريح (أقرب لهوية النظارات)
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F6F6F6",
          100: "#E7E7E7",
          200: "#CFCFCF",
          300: "#ADADAD",
          400: "#7C7C7C",
          500: "#5A5A5A",
          600: "#3F3F3F",
          700: "#2A2A2A",
          800: "#181818",
          900: "#0A0A0A",
          950: "#050505",
        },
        accent: {
          50: "#FFF3ED",
          100: "#FFE0D1",
          200: "#FFC0A8",
          300: "#FF9A76",
          400: "#FF7043",
          500: "#F4511E",
          600: "#D63E0F",
          700: "#B02F0A",
          800: "#8A2508",
          900: "#6B1D06",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          300: "#FCD34D",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          900: "#78350F",
        },
        sand: {
          50: "#FAF3E0",
          100: "#F5E0D2",
          200: "#E8C5A8",
          300: "#D4A88C",
        },
        desert: {
          50: "#FFF9F4",
          100: "#F7EFE2",
          200: "#E8D5C7",
          300: "#D1B5A0",
        },
      },
      fontFamily: {
        // خطوط نظام تدعم العربية بلا تحميل خارجي؛ يُستبدل لاحقاً بـ Tajawal/IBM Plex Sans Arabic
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Tahoma",
          "Noto Sans Arabic",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Georgia", "Iowan Old Style", "Times New Roman", "serif"],
      },
      letterSpacing: {
        brand: "0.35em",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(10, 10, 10, 0.18)",
        card: "0 1px 2px rgba(10, 10, 10, 0.06), 0 12px 24px -18px rgba(10, 10, 10, 0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      maxWidth: {
        shell: "80rem",
      },
    },
  },
  plugins: [],
};

export default config;
