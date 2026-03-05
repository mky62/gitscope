"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";

type ProfileData = {
    stageName: string;
    username: string;
    avatarUrl: string | null;
    description: string | null;
    socialLinks: unknown;
    isPublic: boolean;
};

export default function OwnerProfile({ user }: { user: ProfileData }) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [stageName, setStageName] = useState(user.stageName);
    const [description, setDescription] = useState(user.description ?? "");
    const [isPublic, setIsPublic] = useState(user.isPublic);
    const [twitter, setTwitter] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [website, setWebsite] = useState("");

    // Parse existing social links
    useState(() => {
        if (user.socialLinks && typeof user.socialLinks === "object") {
            const links = user.socialLinks as Record<string, unknown>;
            if (typeof links.twitter === "string") setTwitter(links.twitter);
            if (typeof links.linkedin === "string") setLinkedin(links.linkedin);
            if (typeof links.website === "string") setWebsite(links.website);
        }
    });

    const existingLinks =
        user.socialLinks && typeof user.socialLinks === "object"
            ? (user.socialLinks as Record<string, unknown>)
            : null;

    const entries = existingLinks
        ? Object.entries(existingLinks)
            .filter(([, v]) => typeof v === "string" && v)
            .slice(0, 5)
        : [];

    async function handleSave() {
        setError(null);
        setSuccess(false);
        setSaving(true);
        try {
            const socialLinks: Record<string, string> = {};
            if (twitter.trim()) socialLinks.twitter = twitter.trim();
            if (linkedin.trim()) socialLinks.linkedin = linkedin.trim();
            if (website.trim()) socialLinks.website = website.trim();

            const res = await fetch("/api/profile/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stageName,
                    description,
                    isPublic,
                    socialLinks,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error ?? "Update failed");
            }

            setSuccess(true);
            setEditing(false);
            router.refresh();
        } catch (e: unknown) {
            const msg =
                typeof e === "object" && e && "message" in e
                    ? String((e as { message?: unknown }).message)
                    : null;
            setError(msg || "Update failed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="rounded-2xl border bg-card overflow-hidden">
            {/* Profile Header */}
            <div className="relative">
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                <div className="absolute -bottom-8 left-6">
                    <div className="relative size-16 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-lg">
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.stageName}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center text-2xl font-bold text-muted-foreground">
                                {user.stageName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 pt-12">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="truncate text-xl font-bold">{user.stageName}</h2>
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.isPublic ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
                            >
                                {user.isPublic ? "Public" : "Private"}
                            </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            @{user.username} on GitHub
                        </p>
                    </div>
                    <Button
                        variant={editing ? "secondary" : "default"}
                        onClick={() => {
                            setEditing(!editing);
                            setError(null);
                            setSuccess(false);
                        }}
                        className="shrink-0"
                    >
                        <svg
                            className="mr-2 size-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                        </svg>
                        {editing ? "Cancel" : "Edit Profile"}
                    </Button>
                </div>

                {/* Bio */}
                {!editing && user.description && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {user.description}
                    </p>
                )}

                {/* Social links (view mode) */}
                {!editing && entries.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {entries.map(([k, v]) => (
                            <a
                                key={k}
                                href={String(v)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                            >
                                <span className="capitalize">{k}</span>
                                <svg
                                    className="size-3 text-muted-foreground"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </a>
                        ))}
                    </div>
                )}

                {/* Success message */}
                {success && !editing && (
                    <div className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
                        Profile updated successfully!
                    </div>
                )}

                {/* Edit form */}
                {editing && (
                    <div className="mt-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Stage Name
                                </label>
                                <input
                                    type="text"
                                    value={stageName}
                                    onChange={(e) => setStageName(e.target.value)}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="your-stage-name"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Visibility
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${isPublic ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500" : "bg-background text-muted-foreground"}`}
                                >
                                    <span
                                        className={`size-2 rounded-full ${isPublic ? "bg-emerald-500" : "bg-muted-foreground"}`}
                                    />
                                    {isPublic ? "Public Profile" : "Private Profile"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Bio</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                maxLength={280}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                placeholder="Tell visitors about yourself…"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {description.length}/280
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Twitter
                                </label>
                                <input
                                    type="url"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="https://twitter.com/…"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    LinkedIn
                                </label>
                                <input
                                    type="url"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="https://linkedin.com/in/…"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="https://yoursite.dev"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setEditing(false);
                                    setError(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button disabled={saving} onClick={handleSave}>
                                {saving ? "Saving…" : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
