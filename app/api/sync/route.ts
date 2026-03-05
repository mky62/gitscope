import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { syncRepos } from "@/lib/sync";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await syncRepos(userId, { force: true });
  return NextResponse.json({ ok: true });
}

