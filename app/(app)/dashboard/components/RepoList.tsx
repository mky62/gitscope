"use client";

import { useState, useMemo } from "react";

type RepoData = {
    id: string;
    name: string;
    fullName: string;
    language: string | null;
    stars: number;
    htmlUrl: string;
};

const languageColors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Lua: "#000080",
    Scala: "#c22d40",
    Elixir: "#6e4a7e",
    Haskell: "#5e5086",
    Zig: "#ec915c",
};

export default function RepoList({ repos }: { repos: RepoData[] }) {
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const languages = useMemo(() => {
        const langs = new Set<string>();
        repos.forEach((r) => {
            if (r.language) langs.add(r.language);
        });
        return Array.from(langs).sort();
    }, [repos]);

    const filtered = useMemo(() => {
        let result = repos;
        if (filter !== "all") {
            result = result.filter((r) => r.language === filter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.name.toLowerCase().includes(q)
            );
        }
        return result;
    }, [repos, filter, search]);

    return (
        <div>
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        Repositories
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {filtered.length}
                            {filtered.length !== repos.length ? ` of ${repos.length}` : ""}
                        </span>
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search repos…"
                            className="w-48 rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Language filter */}
                    {languages.length > 0 && (
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="all">All Languages</option>
                            {languages.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl border bg-card p-10 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-secondary">
                        <svg
                            className="size-6 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                            <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {repos.length === 0
                            ? "No repositories synced yet. Hit Sync to fetch your repos."
                            : "No repositories match your filters."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {filtered.map((repo) => (
                        <a
                            key={repo.id}
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group rounded-2xl border bg-card p-5 transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm"
                        >
                            {/* Repo name + badges */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate font-semibold group-hover:text-primary transition-colors">
                                            {repo.name}
                                        </span>
                                    </div>
                                </div>
                                <svg
                                    className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </div>

                            {/* Footer stats */}
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                {repo.language && (
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            className="size-2.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    languageColors[repo.language] ?? "#8b8b8b",
                                            }}
                                        />
                                        {repo.language}
                                    </span>
                                )}
                                {repo.stars > 0 && (
                                    <span className="flex items-center gap-1">
                                        <svg
                                            className="size-3.5"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        {repo.stars}
                                    </span>
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
