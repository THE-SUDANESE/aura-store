"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition " +
  "placeholder:text-ink-300 focus:border-ink-900 focus:ring-1 focus:ring-ink-900";

const labelClasses = "mb-1.5 block text-xs font-medium text-ink-700";

type Message = { type: "ok" | "error"; text: string } | null;

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "كلمتا المرور الجديدتان غير متطابقتين." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "كلمة المرور الجديدة يجب أن تكون ٨ أحرف على الأقل." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setMessage({
          type: "error",
          text: payload?.error?.message ?? "تعذّر تغيير كلمة المرور.",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({
        type: "ok",
        text: "تم تغيير كلمة المرور. استخدم الكلمة الجديدة في تسجيل الدخول القادم.",
      });
    } catch {
      setMessage({ type: "error", text: "تعذّر الاتصال بالخادم." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 max-w-lg rounded-3xl border border-ink-100 bg-white p-6 shadow-card"
    >
      <h2 className="text-sm font-semibold text-ink-900">تغيير كلمة المرور</h2>
      <p className="mt-1.5 text-[11px] text-ink-400">
        يلزم إدخال الكلمة الحالية. الحد الأدنى ٨ أحرف، والحد الأقصى ٧٢ حرفاً.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="current-password" className={labelClasses}>
            كلمة المرور الحالية
          </label>
          <input
            id="current-password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            className={inputClasses}
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="new-password" className={labelClasses}>
            كلمة المرور الجديدة
          </label>
          <input
            id="new-password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            className={inputClasses}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className={labelClasses}>
            تأكيد الكلمة الجديدة
          </label>
          <input
            id="confirm-password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            className={inputClasses}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="submit" size="md" isLoading={isSaving}>
          حفظ كلمة المرور
        </Button>

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={message.type === "error" ? "text-xs text-warning-700" : "text-xs text-accent-700"}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
