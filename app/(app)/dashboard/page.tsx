import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import GitConnect from "./components/GitConnect";

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


export default function DashboardPage() {
    return (
        <div className="w-full h-screen flex flex-col">

            {/* Top Bar */}
            <div className="h-12 border-b border-black flex items-center px-4">
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col md:flex-row">

                {/* Sidebar */}
                <div className="w-full md:w-[30%] lg:w-[40%] border-b md:border-b-0 md:border-r border-black">
                </div>

                {/* Main Panel */}
                <div className="w-full md:w-[70%] lg:w-[60%] p-2">
 {/* Sync Controls */}
        <GitConnect
          syncStatus={data.syncStatus}
          lastSyncedAt={data.lastSyncedAt?.toISOString() ?? null}
          repoCount={data.repos.length}
        />                </div>

            </div>
        </div>
    )
}