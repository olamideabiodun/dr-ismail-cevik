"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

/**
 * Admin sign-in.
 *
 * Uses the browser Supabase client so @supabase/ssr writes the session cookies
 * that proxy.ts and the admin layout then read. `router.refresh()` is what makes
 * the server re-render with the new cookies before navigating.
 */
export function LoginForm({ nextPath }: { nextPath: string }) {
  const t = useTranslations("admin");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Deliberately generic: distinguishing "no such user" from "wrong
        // password" would confirm which addresses have accounts.
        setError("invalidCredentials");
        return;
      }

      router.refresh();
      router.push(nextPath);
    } catch {
      setError("invalidCredentials");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">
          {t("email")}
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="h-12 w-full rounded-[var(--radius-input)] border border-line bg-bg-elevated px-4 text-[0.9375rem] text-ink focus:border-brand focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink">
          {t("password")}
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
          className="h-12 w-full rounded-[var(--radius-input)] border border-line bg-bg-elevated px-4 text-[0.9375rem] text-ink focus:border-brand focus:outline-none"
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-input)] border border-[#E8C9C1] bg-[#FBF1EF] px-4 py-3 text-sm text-[#B4442F]"
        >
          {t(error)}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? t("signingIn") : t("signIn")}
      </Button>
    </form>
  );
}
