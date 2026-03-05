import type { Repo } from "@prisma/client";

export default function PublicRepoList({ repos }: { repos: Repo[] }) {
  if (!repos.length) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        No repos cached yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {repos.map((repo) => (
        <a
          key={repo.id}
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border bg-card p-5 transition-colors hover:bg-accent"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{repo.name}</div>
              <div className="truncate text-sm text-muted-foreground">
                {repo.fullName}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>★ {repo.stars}</span>
              {repo.language ? <span>{repo.language}</span> : null}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

