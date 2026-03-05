import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { syncRepos } from "@/lib/sync";

export const runtime = "nodejs";

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
};

export default async function StageNamePage({
  params,
}: {
  params: Promise<{ stageName: string }>;
}) {
  const { stageName } = await params;
  const { userId } = await auth();

  const user = await prisma.user.findUnique({
    where: { stageName },
    include: {
      repos: {
        orderBy: [{ stars: "desc" }, { name: "asc" }],
      },
    },
  });

  if (!user) notFound();

  const isOwner = userId === user.id;
  if (!user.isPublic && !isOwner) notFound();

  // Owner visiting their own public profile triggers sync
  if (isOwner) {
    await syncRepos(user.id);
  }

  const socialLinks =
    user.socialLinks && typeof user.socialLinks === "object"
      ? (user.socialLinks as Record<string, unknown>)
      : null;

  const entries = socialLinks
    ? Object.entries(socialLinks)
      .filter(([, v]) => typeof v === "string" && v)
      .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user.stageName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Public developer portfolio
            </p>
          </div>
          <a
            href="/home"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            <svg
              className="size-4"
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
            Search
          </a>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border bg-card overflow-hidden">
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
                <h2 className="truncate text-xl font-bold">
                  {user.stageName}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  @{user.username} on GitHub
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{user.repos.length} repos</span>
              </div>
            </div>

            {user.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {user.description}
              </p>
            )}

            {entries.length > 0 && (
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
          </div>
        </div>

        {/* Repositories */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-semibold">
            Repositories
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {user.repos.length}
            </span>
          </h2>

          {user.repos.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No public repositories yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {user.repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border bg-card p-5 transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm"
                >
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
      </div>
    </div>
  );
}
