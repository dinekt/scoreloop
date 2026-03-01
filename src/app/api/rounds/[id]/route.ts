import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";
import { calculateRoundStats } from "@/lib/utils/golf-stats";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/rounds/[id] - ラウンド詳細取得
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { id } = await params;

  const round = await prisma.round.findFirst({
    where: { id, userId: auth.userId },
    include: { holes: { orderBy: { holeNumber: "asc" } } },
  });

  if (!round) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "ラウンドが見つかりません" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: round });
}

// PUT /api/rounds/[id] - ラウンド更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { id } = await params;

  const existing = await prisma.round.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "ラウンドが見つかりません" } },
      { status: 404 }
    );
  }

  const body = await request.json();

  // ホールデータが含まれている場合、スタッツを再計算
  let stats = {};
  if (body.holes && Array.isArray(body.holes)) {
    stats = calculateRoundStats(body.holes);

    // 既存のホールデータを削除して再作成
    await prisma.holeData.deleteMany({ where: { roundId: id } });
    await prisma.holeData.createMany({
      data: body.holes.map((hole: Record<string, unknown>) => ({
        roundId: id,
        holeNumber: hole.holeNumber,
        par: hole.par,
        score: hole.score,
        putts: hole.putts,
        fairway: hole.fairway ?? null,
        greenInRegulation: hole.greenInRegulation ?? false,
        penalty: hole.penalty ?? 0,
        missType: hole.missType ?? null,
        missDetail: hole.missDetail ?? null,
        clubUsed: hole.clubUsed ?? null,
        approachDistance: hole.approachDistance ?? null,
        approachClub: hole.approachClub ?? null,
      })),
    });
  }

  const round = await prisma.round.update({
    where: { id },
    data: {
      ...(body.playedAt && { playedAt: new Date(body.playedAt) }),
      ...(body.courseName && { courseName: body.courseName }),
      ...(body.courseRating !== undefined && { courseRating: body.courseRating }),
      ...(body.slopeRating !== undefined && { slopeRating: body.slopeRating }),
      ...(body.weather !== undefined && { weather: body.weather }),
      ...(body.wind !== undefined && { wind: body.wind }),
      ...(body.temperature !== undefined && { temperature: body.temperature }),
      ...(body.memo !== undefined && { memo: body.memo }),
      ...stats,
    },
    include: { holes: { orderBy: { holeNumber: "asc" } } },
  });

  return NextResponse.json({ success: true, data: round });
}

// DELETE /api/rounds/[id] - ラウンド削除
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { id } = await params;

  const existing = await prisma.round.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "ラウンドが見つかりません" } },
      { status: 404 }
    );
  }

  await prisma.round.delete({ where: { id } });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
