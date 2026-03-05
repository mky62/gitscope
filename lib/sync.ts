import { prisma } from "@/lib/prisma";
import { fetchGitPublicRepo } from "@/services/github";

const SYNC_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function syncRepos(
  userId: string,
  opts?: { force?: boolean }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const shouldSync =
    opts?.force ||
    user.syncStatus === "FAILED" ||
    !user.lastSyncedAt ||
    Date.now() - user.lastSyncedAt.getTime() > SYNC_TTL_MS;

  if (!shouldSync) return;

  // atomic lock 
  const lock = await prisma.user.updateMany({
    where: {
      id: userId,
      syncStatus: { not: "SYNCING" }
    },
    data: {
      syncStatus: "SYNCING"
    }
  });

  if (lock.count === 0) return;

  try {
    const repos = await fetchGitPublicRepo(user.username)

    await prisma.$transaction(async (tx) => {
      const githubRepoIds: number[] = [];

      for (const repo of repos) {
        if (!repo.id || !repo.full_name || !repo.html_url) continue;

        githubRepoIds.push(repo.id)

        const name =
          repo.name ??
          repo.full_name.split("/").pop() ??
          repo.full_name;

        await tx.repo.upsert({
          where: { githubRepoId: repo.id },
          update: {
            userId,
            name,
            fullName: repo.full_name,
            language: repo.language,
            stars: repo.stargazers_count ?? 0,
            htmlUrl: repo.html_url,
            cachedAt: new Date(),
          },
          create: {
            githubRepoId: repo.id,
            userId,
            name,
            fullName: repo.full_name,
            language: repo.language,
            stars: repo.stargazers_count ?? 0,
            htmlUrl: repo.html_url,
          },
        });
      }

      //Delete repos that are no longer present in github
      await tx.repo.deleteMany({
        where: {
          userId,
          githubRepoId: { notIn: githubRepoIds },
        },
      });

      await tx.user.update({
        where: {
          id: userId
        },
        data: {
          syncStatus: "SUCCESS",
          lastSyncedAt: new Date(),
        }
      })
    });
  }
  catch (error) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        syncStatus: "FAILED",
      }
    })
  }
}
