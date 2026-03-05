import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function normalizeStageName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (slug.length < 3 || slug.length > 32) return null;
  return slug;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const stageName = b.stageName ? normalizeStageName(b.stageName) : undefined;
  if (b.stageName && !stageName) {
    return NextResponse.json(
      { error: "Invalid stageName (3-32 chars, a-z0-9-_ only)" },
      { status: 400 }
    );
  }

  const description =
    typeof b.description === "string" ? b.description.slice(0, 280) : undefined;

  const isPublic = typeof b.isPublic === "boolean" ? b.isPublic : undefined;

  const socialLinks =
    b.socialLinks && typeof b.socialLinks === "object" ? b.socialLinks : undefined;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(stageName ? { stageName } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
        ...(socialLinks !== undefined ? { socialLinks } : {}),
      },
      select: {
        id: true,
        stageName: true,
        username: true,
        avatarUrl: true,
        description: true,
        socialLinks: true,
        isPublic: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e: unknown) {
    const msg =
      typeof e === "object" && e && "message" in e
        ? String((e as { message?: unknown }).message ?? "")
        : "";
    const code =
      typeof e === "object" && e && "code" in e
        ? String((e as { code?: unknown }).code ?? "")
        : "";

    if (msg.includes("Unique constraint failed") || code === "P2002") {
      return NextResponse.json({ error: "stageName is already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

