import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
        where: {
            isPublic: true,
            OR: [
                { stageName: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
            ],
        },
        select: {
            stageName: true,
            username: true,
            avatarUrl: true,
            description: true,
            _count: { select: { repos: true } },
        },
        take: 10,
        orderBy: { stageName: "asc" },
    });

    return NextResponse.json({ users });
}
