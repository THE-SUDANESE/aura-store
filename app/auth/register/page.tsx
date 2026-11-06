"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون ٨ أحرف على الأقل");
      return;
    }

    setIsSubmitting(true);

    try {
      // مسارات نسبية: تعمل على النطاق نفسه في التطوير والإنتاج
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setError(
          typeof result?.error === "string"
            ? result.error
            : "تعذّر إنشاء الحساب، حاول مرة أخرى",
        );
        return;
      }

      router.push("/auth/login?registered=1");
    } catch {
      setError("حدث خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="fade-in w-full max-w-md">
        <div className="card-soft rounded-3xl bg-white p-8">
          <h1 className="mb-6 text-center font-display text-2xl font-bold text-ink-900">
            إنشاء حساب جديد
          </h1>

          {error && (
            <div className="mb-6 rounded-xl border border-warning-300 bg-warning-50 p-4 text-sm text-warning-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink-600">
                الاسم الكامل
              </label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="اسمك الكامل"
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-600">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@aura.sa"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink-600">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="٨ أحرف على الأقل"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-ink-600">
                تأكيد كلمة المرور
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              تسجيل الحساب
            </Button>

            <p className="text-center text-sm text-ink-500">
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="font-medium text-accent-600 hover:underline">
                دخول
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
