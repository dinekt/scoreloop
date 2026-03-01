import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";
import { getOpenAI, AI_MODEL } from "@/lib/openai/client";
import { buildTrainingPlanPrompt } from "@/lib/openai/prompts/training-plan";
import { TrainingPlanSchema } from "@/lib/openai/schemas/training-plan";
import { format } from "date-fns";

// POST /api/analysis/training-plan
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const body = await request.json();
  const weekStartDate = body.weekStartDate as string;

  if (!weekStartDate) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "weekStartDateが必要です" } },
      { status: 400 }
    );
  }

  // ユーザープロフィール
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { averageScore: true, headSpeed: true, handicap: true, golfStartYear: true },
  });

  // 直近の分析レポート
  const recentAnalysis = await prisma.analysisReport.findMany({
    where: { userId: auth.userId, reportType: "ROUND_ANALYSIS" },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { content: true },
  });

  // 直近の練習ログ
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentPractices = await prisma.practice.findMany({
    where: { userId: auth.userId, practicedAt: { gte: fourWeeksAgo } },
    orderBy: { practicedAt: "desc" },
    include: { items: { select: { category: true, ballCount: true } } },
  });

  // 直近ラウンドIDs
  const recentRounds = await prisma.round.findMany({
    where: { userId: auth.userId },
    orderBy: { playedAt: "desc" },
    take: 5,
    select: { id: true },
  });

  const prompt = buildTrainingPlanPrompt({
    recentAnalysis: recentAnalysis.map((a) => a.content as Record<string, unknown>),
    recentPractices: recentPractices.map((p) => ({
      practicedAt: format(p.practicedAt, "yyyy-MM-dd"),
      location: p.location,
      durationMin: p.durationMin,
      items: p.items,
    })),
    userProfile: {
      averageScore: user?.averageScore ?? null,
      headSpeed: user?.headSpeed ?? null,
      handicap: user?.handicap ?? null,
      golfStartYear: user?.golfStartYear ?? null,
    },
    weekStartDate,
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
        { success: false, error: { code: "AI_ERROR", message: "AI応答が空です" } },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawContent);
    const validated = TrainingPlanSchema.parse(parsed);

    // 既存プランがあれば更新、なければ作成
    const plan = await prisma.trainingPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: auth.userId,
          weekStartDate: new Date(weekStartDate),
        },
      },
      update: {
        content: JSON.parse(JSON.stringify(validated)),
        basedOnRoundIds: recentRounds.map((r) => r.id),
        focusAreas: validated.focusAreas.map((f) => f.area),
      },
      create: {
        userId: auth.userId,
        weekStartDate: new Date(weekStartDate),
        content: JSON.parse(JSON.stringify(validated)),
        basedOnRoundIds: recentRounds.map((r) => r.id),
        focusAreas: validated.focusAreas.map((f) => f.area),
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (err) {
    console.error("Training plan generation error:", err);
    return NextResponse.json(
      { success: false, error: { code: "AI_ERROR", message: "プラン生成中にエラーが発生しました" } },
      { status: 500 }
    );
  }
}
