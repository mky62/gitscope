
type SyncStatus = "IDLE" | "SYNCING" | "SUCCESS" | "FAILED";

const STATUS_CONFIG: Record<SyncStatus, { label: string; color: string; dotColor: string }> = {
    IDLE: { label: "Idle", color: "text-muted-foreground", dotColor: "bg-muted-foreground" },
    SYNCING: { label: "Syncing…", color: "text-blue-500", dotColor: "bg-blue-500" },
    SUCCESS: { label: "Synced", color: "text-emerald-500", dotColor: "bg-emerald-500" },
    FAILED: { label: "Failed", color: "text-red-500", dotColor: "bg-red-500" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

export function GitHubIcon() {
    return (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <svg className="size-6 text-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        </div>
    );
}

export function SyncIcon({ spinning }: { spinning: boolean }) {
    return (
        <svg
            className={`mr-2 size-4 ${spinning ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>
    );
}

export function StatusBadge({ status }: { status: SyncStatus }) {
    const { label, color, dotColor } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            <span className={`size-1.5 rounded-full ${dotColor} ${status === "SYNCING" ? "animate-pulse" : ""}`} />
            {label}
        </span>
    );
}