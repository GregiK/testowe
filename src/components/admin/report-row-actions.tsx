"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportRowActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: "RESOLVED" | "DISMISSED") {
    setBusy(true);
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => updateStatus("RESOLVED")}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--match)" }}
      >
        Rozpatrzone
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => updateStatus("DISMISSED")}
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] disabled:opacity-50"
      >
        Odrzuć
      </button>
    </div>
  );
}
