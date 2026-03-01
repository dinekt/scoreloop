import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";
import { getOpenAI, AI_MODEL } from "@/lib/openai/client";
import { buildRoundAnalysisPrompt } from "@/lib/openai/prompts/round-analysis";
import { RoundAnalysisSchema } from "@/lib/openai/schemas/round-analysis";
import { format } from "date-fns";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/rounds/[id]/analyze
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { id } = await params;

  // ラウンドデータ取得
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

  // ユーザープロフィール取得
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { averageScore: true, headSpeed: true, handicap: true, golfStartYear: true },
  });

  // 直近ラウンド取得
  const recentRounds = await prisma.round.findMany({
    where: { userId: auth.userId, id: { not: id } },
    orderBy: { playedAt: "desc" },
    take: 10,
    select: {
      playedAt: true,
      courseName: true,
      totalScore: true,
      fairwayHit: true,
      fairwayTotal: true,
      girCount: true,
      totalPutts: true,
    },
  });

  // 直近4週間の練習ログ
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentPractices = await prisma.practice.findMany({
    where: { userId: auth.userId, practicedAt: { gte: fourWeeksAgo } },
    orderBy: { practicedAt: "desc" },
    include: { items: { select: { category: true, ballCount: true } } },
  });

  // プロンプト構築
  const prompt = buildRoundAnalysisPrompt({
    round: {
      courseName: round.courseName,
      playedAt: format(round.playedAt, "yyyy-MM-dd"),
      weather: round.weather,
      wind: round.wind,
      totalScore: round.totalScore,
      outScore: round.outScore,
      inScore: round.inScore,
      holes: round.holes.map((h) => ({
        holeNumber: h.holeNumber,
        par: h.par,
        score: h.score,
        putts: h.putts,
        fairway: h.fairway,
        greenInRegulation: h.greenInRegulation,
        penalty: h.penalty,
        missType: h.missType,
        missDetail: h.missDetail,
      })),
    },
    recentRounds: recentRounds.map((r) => ({
      playedAt: format(r.playedAt, "yyyy-MM-dd"),
      courseName: r.courseName,
      totalScore: r.totalScore,
      fairwayHit: r.fairwayHit,
      fairwayTotal: r.fairwayTotal,
      girCount: r.girCount,
      totalPutts: r.totalPutts,
    })),
    recentPractices: recentPractices.map((p) => ({
      practicedAt: format(p.practicedAt, "yyyy-MM-dd"),
      location: p.location,
      durationMin: p.durationMin,
      feelRating: p.feelRating,
      items: p.items,
    })),
    userProfile: {
      averageScore: user?.averageScore ?? null,
      headSpeed: user?.headSpeed ?? null,
      handicap: user?.handicap ?? null,
      golfStartYear: user?.golfStartYear ?? null,
    },
  });

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: { code: "AI_ERROR", message: "AI分析の応答が空です" } },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawContent);
    const validated = RoundAnalysisSchema.parse(parsed);

    // DB保存
    const report = await prisma.analysisReport.create({
      data: {
        userId: auth.userId,
        roundId: id,
        reportType: "ROUND_ANALYSIS",
        content: JSON.parse(JSON.stringify(validated)),
        modelUsed: AI_MODEL,
        promptTokens: completion.usage?.prompt_tokens ?? null,
        completionTokens: completion.usage?.completion_tokens ?? null,
      },
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (err) {
    console.error("AI analysis error:", err);
    return NextResponse.json(
      { success: false, error: { code: "AI_ERROR", message: "AI分析中にエラーが発生しました" } },
      { status: 500 }
    );
  }
}
