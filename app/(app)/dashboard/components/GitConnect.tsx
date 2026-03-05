'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'
import { GitHubIcon, StatusBadge, SyncIcon } from './Icons';
import timeAgo from '@/helpers/timeago';

type SyncStatus = "IDLE" | "SYNCING" | "SUCCESS" | "FAILED";

interface GitConnectProps {
    syncStatus: SyncStatus;
    lastSyncedAt: string | null;
    repoCount: number;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Sync failed";
}


export default function GitConnect({ syncStatus, lastSyncedAt, repoCount }: GitConnectProps) {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isBusy = loading || syncStatus === "SYNCING";

    async function handleSync() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/syncrepo", { method: "POST" });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.erro || "Failed to sync repos");
            }
            router.refresh();
        }
        catch (e) {
            setError(getErrorMessage(e));
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <GitHubIcon />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">GitHub Sync</h3>
                            <StatusBadge status={syncStatus} />
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{repoCount} repos cached</span>
                            {lastSyncedAt && (
                                <>
                                    <span className="text-border">•</span>
                                    <span>Last synced {timeAgo(lastSyncedAt)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    disabled={isBusy}
                    onClick={handleSync}
                    className="shrink-0"
                >
                    <SyncIcon spinning={loading} />
                    {loading ? "Syncing…" : "Sync Now"}
                </Button>
            </div>

            {error && (
                <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}
