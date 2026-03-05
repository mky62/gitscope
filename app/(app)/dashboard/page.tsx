import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import GitConnect from "./components/GitConnect";
import OwnerProfile from "./components/OwnerProfile";
import RepoList from "./components/RepoList";
import DeleteAccount from "./components/DeleteAccount";

export const runtime = "nodejs";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserWithRepos = NonNullable<Awaited<ReturnType<typeof fetchUser>>>;

// ─── Data helpers ─────────────────────────────────────────────────────────────

const USER_WITH_REPOS_QUERY = {
  include: {
    repos: {
      orderBy: [{ stars: "desc" }, { name: "asc" }] as const,
    },
  },
} as const;

async function fetchUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    ...USER_WITH_REPOS_QUERY,
  });
}

const GITHUB_PROVIDERS = new Set(["github", "oauth_github", "oauth_github_enterprise"]);

async function provisionUser(userId: string): Promise<UserWithRepos> {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const githubUsername =
    clerkUser.externalAccounts?.find((a) => GITHUB_PROVIDERS.has(a.provider))?.username ??
    clerkUser.username;

  if (!githubUsername) redirect("/sign-in");

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      username: githubUsername,
      avatarUrl: clerkUser.imageUrl ?? null,
    },
    create: {
      id: userId,
      stageName: githubUsername,
      username: githubUsername,
      avatarUrl: clerkUser.imageUrl ?? null,
    },
  });

  const user = await fetchUser(userId);
  if (!user) redirect("/sign-in");
  return user;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = (await fetchUser(userId)) ?? (await provisionUser(userId));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your profile and GitHub repositories
          </p>
        </header>

        <GitConnect
          syncStatus={user.syncStatus}
          lastSyncedAt={user.lastSyncedAt?.toISOString() ?? null}
          repoCount={user.repos.length}
        />

        <div className="mt-6">
          <OwnerProfile
            user={{
              stageName: user.stageName,
              username: user.username,
              avatarUrl: user.avatarUrl,
              description: user.description,
              socialLinks: user.socialLinks,
              isPublic: user.isPublic,
            }}
          />
        </div>

        <div className="mt-6">
          <RepoList repos={user.repos} />
        </div>

        <DangerZone />
      </div>
    </div>
  );
}

function DangerZone() {
  return (
    <section className="mt-10 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
      <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Permanently delete your account, profile, and all synced repositories.
      </p>
      <div className="mt-4">
        <DeleteAccount />
      </div>
    </section>
  );
}