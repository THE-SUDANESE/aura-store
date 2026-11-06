"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // قراءة ?redirect= من الرابط دون الحاجة إلى Suspense حدود useSearchParams
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("redirect");
    if (target && target.startsWith("/")) setRedirectTo(target);
    if (params.get("registered") === "1") setNotice("تم إنشاء حسابك بنجاح، يمكنك تسجيل الدخول الآن.");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : "تعذّر تسجيل الدخول، حاول مرة أخرى",
        );
        return;
      }

      router.push(redirectTo);
      router.refresh();
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
            دخول إلى حسابك
          </h1>

          {error && (
            <div className="mb-6 rounded-xl border border-warning-300 bg-warning-50 p-4 text-sm text-warning-700">
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-6 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              دخول
            </Button>

            <p className="text-center text-sm text-ink-500">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="font-medium text-accent-600 hover:underline">
                أنشئ حساباً
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
