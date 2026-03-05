import Image from "next/image";

import type { User } from "@prisma/client";

export default function PublicProfile({
  user,
  isOwner,
}: {
  user: Pick<User, "stageName" | "username" | "avatarUrl" | "description" | "socialLinks">;
  isOwner: boolean;
}) {
  const links =
    user.socialLinks && typeof user.socialLinks === "object"
      ? (user.socialLinks as Record<string, unknown>)
      : null;

  const entries = links
    ? Object.entries(links)
        .filter(([, v]) => typeof v === "string" && v)
        .slice(0, 5)
    : [];

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative size-14 overflow-hidden rounded-xl border bg-muted">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.stageName}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold">{user.stageName}</div>
            <div className="truncate text-sm text-muted-foreground">
              GitHub: {user.username}
              {isOwner ? " (you)" : ""}
            </div>
          </div>
        </div>

        {entries.length ? (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {entries.map(([k, v]) => (
              <a
                key={k}
                href={String(v)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
              >
                {k}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {user.description ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {user.description}
        </p>
      ) : null}
    </div>
  );
}

