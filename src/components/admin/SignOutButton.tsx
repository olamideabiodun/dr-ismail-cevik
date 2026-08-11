"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction();
          // Re-render server components so the cleared cookies take effect,
          // then let proxy.ts route the now-anonymous request to login.
          router.refresh();
          router.push("/admin");
        })
      }
    >
      {t("signOut")}
    </Button>
  );
}
