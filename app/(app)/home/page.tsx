"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NextImage from "next/image";
import { useAuth } from "@clerk/nextjs";

type SearchResult = {
    stageName: string;
    username: string;
    avatarUrl: string | null;
    description: string | null;
    _count: { repos: number };
};

function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
                if (res.ok) setResults((await res.json()).users ?? []);
            } catch { /* ignore */ } finally { setLoading(false); }
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    return (
        <div className="relative mx-auto w-full max-w-2xl">
            <div className={`relative rounded-2xl bg-card border shadow-2xl shadow-black/10 transition-all duration-200 ${open && query.trim().length >= 2 ? "rounded-b-none border-b-0" : ""}`}>
                <div className="flex items-center gap-3 px-5 py-4">
                    <svg className="size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                        placeholder="Search by username or stage name…"
                        className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/50 sm:text-lg"
                    />
                    {loading && (
                        <svg className="size-5 shrink-0 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {open && query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 z-50 overflow-hidden rounded-b-2xl border border-t-0 bg-card shadow-2xl shadow-black/10">
                    {results.length === 0 && !loading ? (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-muted-foreground">No developers found for &ldquo;{query}&rdquo;</p>
                        </div>
                    ) : (
                        <div className="max-h-72 overflow-y-auto py-2">
                            {results.map((user) => (
                                <button
                                    key={user.stageName}
                                    type="button"
                                    onMouseDown={() => router.push(`/${user.stageName}`)}
                                    className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-accent"
                                >
                                    <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                                        {user.avatarUrl ? (
                                            <Image src={user.avatarUrl} alt={user.stageName} fill sizes="40px" className="object-cover" />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-sm font-bold text-muted-foreground">
                                                {user.stageName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-semibold">{user.stageName}</div>
                                        <div className="truncate text-sm text-muted-foreground">
                                            @{user.username} · {user._count.repos} repositories
                                        </div>
                                    </div>
                                    <svg className="size-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const features = [
    {
        icon: (
            <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        ),
        title: "GitHub-Powered",
        description: "Automatically syncs your public GitHub repositories into a clean, browsable portfolio.",
    },
    {
        icon: (
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Cached & Fast",
        description: "Repos are cached in a database so your profile loads instantly — no GitHub API calls on every visit.",
    },
    {
        icon: (
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        ),
        title: "Custom Identity",
        description: "Set a custom stage name and bio, add social links, and control whether your profile is public or private.",
    },
    {
        icon: (
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
        ),
        title: "Discoverable",
        description: "Anyone can search for developers by name and view their public portfolio without needing an account.",
    },
];

function Navbar() {
    const { isSignedIn } = useAuth();
    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setDropOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="pointer-events-none fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-4">
            <header className="pointer-events-auto w-full max-w-2xl rounded-2xl border bg-background/80 backdrop-blur-md shadow-lg shadow-black/5">
                <div className="flex h-14 items-center justify-between px-5">
                    {/* Logo */}
                    <div className="flex items-center">
                        <NextImage src="/croplogo.png" alt="unfinished" width={110} height={36} className="h-8 w-auto object-contain" />
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Dropdown: More */}
                        <div ref={dropRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setDropOpen((v) => !v)}
                                className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                More
                                <svg className={`size-3.5 transition-transform ${dropOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>
                            {dropOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border bg-card shadow-lg">
                                    <a href="/blog" className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent">
                                        <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                        Blog
                                    </a>
                                    <a href="/policy" className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-accent">
                                        <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        Policy
                                    </a>
                                </div>
                            )}
                        </div>

                        {isSignedIn ? (
                            <a
                                href="/dashboard"
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                                Dashboard
                            </a>
                        ) : (
                            <>
                                <a
                                    href="/sign-up"
                                    className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Get Started
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}


export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <section className="relative overflow-hidden">
                {/* Brand gradient background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Base gradient: orange top-left → blue bottom-right */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#EB742A55_0%,_transparent_55%),radial-gradient(ellipse_at_bottom-right,_#A5DAF255_0%,_transparent_55%)]" />
                    {/* Blurred orbs for depth */}
                    <div className="absolute -top-32 -left-20 size-[500px] rounded-full bg-[#EB742A]/20 blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 size-[450px] rounded-full bg-[#A5DAF2]/25 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] rounded-full bg-[#A5DAF2]/10 blur-2xl" />
                    {/* Fade to background at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="relative mx-auto max-w-4xl px-4 pt-24 pb-20 text-center sm:px-6 sm:pt-32 sm:pb-28">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        GitHub-connected developer portfolios
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Your code,{" "}
                        <span className="relative">
                            <span className="relative z-10">beautifully</span>
                            <span className="absolute bottom-1 left-0 right-0 h-3 -z-10 bg-primary/15 rounded" />
                        </span>
                        {" "}showcased
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                        Create your public developer portfolio powered by GitHub. Sync your repositories, add a bio, share social links — all in one clean profile.
                    </p>

                    <div className="mt-10">
                        <SearchBar />
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <svg className="size-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Free forever
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="size-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            GitHub OAuth only
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="size-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Public or private
                        </span>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative border-t">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top-right,_#A5DAF215_0%,_transparent_60%)]" />
                <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
                        <p className="mt-4 text-muted-foreground">
                            A simple, powerful platform built specifically for developers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
                            >
                                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    {f.icon}
                                </div>
                                <h3 className="mb-2 font-semibold">{f.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="border-t">
                <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get started in minutes</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        {[
                            { step: "01", title: "Sign in with GitHub", desc: "Connect your GitHub account via OAuth — no passwords, no setup." },
                            { step: "02", title: "Sync your repos", desc: "Your public repositories are automatically fetched and cached in your profile." },
                            { step: "03", title: "Share your profile", desc: "Share your unique profile URL. Anyone can browse your repos and bio." },
                        ].map((item) => (
                            <div key={item.step} className="relative">
                                <div className="mb-4 text-5xl font-bold text-primary/10">{item.step}</div>
                                <h3 className="mb-2 font-semibold">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative border-t">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#EB742A12_0%,_transparent_65%)]" />
                <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to build your profile?
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Sign in with GitHub and have your developer portfolio live in under a minute.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href="/sign-up"
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                        >
                            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Sign up with GitHub
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-8 text-sm font-semibold transition-colors hover:bg-accent sm:w-auto"
                        >
                            Search developers
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
                    <NextImage src="/croplogo.png" alt="unfinished" width={90} height={30} className="h-7 w-auto object-contain" />
                    <p className="text-xs text-muted-foreground">
                        Built for developers, by developers.
                    </p>
                </div>
            </footer>
        </div>
    );
}
