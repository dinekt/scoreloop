import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/practices/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { id } = await params;

  const practice = await prisma.practice.findFirst({
    where: { id, userId: auth.userId },
    include: { items: true },
  });

  if (!practice) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "練習ログが見つかりません" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: practice });
}

// PUT /api/practices/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { id } = await params;

  const existing = await prisma.practice.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "練習ログが見つかりません" } },
      { status: 404 }
    );
  }

  const body = await request.json();

  // items が含まれている場合、既存を削除して再作成
  if (body.items && Array.isArray(body.items)) {
    await prisma.practiceItem.deleteMany({ where: { practiceId: id } });
    await prisma.practiceItem.createMany({
      data: body.items.map((item: Record<string, unknown>) => ({
        practiceId: id,
        category: item.category,
        detail: item.detail ?? null,
        ballCount: item.ballCount ?? null,
        durationMin: item.durationMin ?? null,
        club: item.club ?? null,
        feelRating: item.feelRating ?? null,
        notes: item.notes ?? null,
      })),
    });
  }

  const practice = await prisma.practice.update({
    where: { id },
    data: {
      ...(body.practicedAt && { practicedAt: new Date(body.practicedAt) }),
      ...(body.location && { location: body.location }),
      ...(body.locationName !== undefined && { locationName: body.locationName }),
      ...(body.durationMin && { durationMin: body.durationMin }),
      ...(body.feelRating !== undefined && { feelRating: body.feelRating }),
      ...(body.memo !== undefined && { memo: body.memo }),
    },
    include: { items: true },
  });

  return NextResponse.json({ success: true, data: practice });
}

// DELETE /api/practices/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { id } = await params;

  const existing = await prisma.practice.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "練習ログが見つかりません" } },
      { status: 404 }
    );
  }

  await prisma.practice.delete({ where: { id } });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
