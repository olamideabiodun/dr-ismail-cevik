"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateAppointmentStatus } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

/**
 * Status transitions for one appointment. Only the moves that make sense from
 * the current status are offered — a cancelled appointment cannot be confirmed
 * back into existence from here, since the slot may already be gone.
 */
export function AppointmentActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();

  const actions: { label: string; next: string; tone: "brand" | "danger" }[] =
    [];

  if (status === "pending") {
    actions.push({ label: t("confirm"), next: "confirmed", tone: "brand" });
    actions.push({ label: t("decline"), next: "cancelled", tone: "danger" });
  } else if (status === "confirmed") {
    actions.push({ label: t("complete"), next: "completed", tone: "brand" });
    actions.push({ label: t("cancel"), next: "cancelled", tone: "danger" });
  }

  if (actions.length === 0) return <span className="text-xs text-muted">—</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.next}
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateAppointmentStatus(id, action.next);
            })
          }
          className={cn(
            "min-h-9 whitespace-nowrap rounded-[var(--radius-pill)] border px-3 text-xs transition-colors disabled:opacity-50",
            action.tone === "brand"
              ? "border-brand text-brand hover:bg-brand hover:text-white"
              : "border-[#E8C9C1] text-[#B4442F] hover:bg-[#B4442F] hover:text-white"
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
