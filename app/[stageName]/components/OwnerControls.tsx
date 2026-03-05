"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";

export default function OwnerControls({
  stageName,
  syncStatus,
  lastSyncedAt,
}: {
  stageName: string;
  syncStatus: string;
  lastSyncedAt: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <div className="font-medium">Owner controls</div>
          <div className="text-muted-foreground">
            Status: {syncStatus}
            {lastSyncedAt ? ` · last synced ${new Date(lastSyncedAt).toLocaleString()}` : ""}
          </div>
        </div>

        <Button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              const res = await fetch("/api/sync", { method: "POST" });
              if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error ?? "Sync failed");
              }
              router.refresh();
              router.push(`/${stageName}`);
            } catch (e: unknown) {
              const msg =
                typeof e === "object" && e && "message" in e
                  ? String((e as { message?: unknown }).message)
                  : null;
              setError(msg || "Sync failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Syncing..." : "Sync repos"}
        </Button>
      </div>

      {error ? (
        <div className="mt-3 text-sm text-destructive">{error}</div>
      ) : null}
    </div>
  );
}

