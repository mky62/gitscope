"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";

export default function DeleteAccount() {
    const { signOut } = useClerk();
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const canDelete = confirmText.trim().toLowerCase() === "delete my account";

    async function handleDelete() {
        setConfirming(true);
        try {
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            // Sign user out and redirect to home after DB deletion
            await signOut({ redirectUrl: "/home" });
        } catch {
            setConfirming(false);
            alert("Something went wrong. Please try again.");
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete Account
            </button>

            {/* Confirmation Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                            <svg className="size-6 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>

                        <h3 className="text-lg font-semibold">Delete your account?</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This will permanently delete your profile, all synced repositories, and your data. This action cannot be undone.
                        </p>

                        <div className="mt-4">
                            <label className="mb-1.5 block text-sm font-medium">
                                Type <span className="font-semibold text-destructive">delete my account</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="delete my account"
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus:border-destructive focus:ring-1 focus:ring-destructive placeholder:text-muted-foreground/40"
                                autoFocus
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setOpen(false); setConfirmText(""); }}
                                className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-accent"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={!canDelete || confirming}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {confirming ? (
                                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                    </svg>
                                ) : null}
                                {confirming ? "Deleting…" : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
