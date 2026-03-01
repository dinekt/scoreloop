import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ScoreTrendChart } from "@/components/rounds/ScoreTrendChart";
import { CurrentFocusCard } from "@/components/dashboard/CurrentFocusCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { PRACTICE_LOCATION_LABELS } from "@/lib/constants/golf";
import type { RoundAnalysis } from "@/lib/openai/schemas/round-analysis";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [recentRounds, recentPractices, latestAnalysis, trendRounds] =
    await Promise.all([
      prisma.round.findMany({
        where: { userId: user.id },
        orderBy: { playedAt: "desc" },
        take: 5,
        select: {
          id: true,
          playedAt: true,
          courseName: true,
          totalScore: true,
        },
      }),
      prisma.practice.findMany({
        where: { userId: user.id },
        orderBy: { practicedAt: "desc" },
        take: 5,
        include: { _count: { select: { items: true } } },
      }),
      prisma.analysisReport.findFirst({
        where: { userId: user.id, reportType: "ROUND_ANALYSIS" },
        orderBy: { createdAt: "desc" },
        select: { content: true },
      }),
      prisma.round.findMany({
        where: { userId: user.id },
        orderBy: { playedAt: "desc" },
        take: 20,
        select: { playedAt: true, totalScore: true, courseName: true },
      }),
    ]);

  // 分析結果から重点テーマを取得
  const analysisContent = latestAnalysis?.content as RoundAnalysis | null;
  const primaryFocus = analysisContent?.improvementPlan?.primaryFocus;
  const nextRoundStrategy =
    analysisContent?.improvementPlan?.nextRoundStrategy ?? null;

  // タイムラインデータ
  const timelineItems = [
    ...recentRounds.map((r) => ({
      type: "round" as const,
      id: r.id,
      date: r.playedAt,
      courseName: r.courseName,
      totalScore: r.totalScore,
    })),
    ...recentPractices.map((p) => ({
      type: "practice" as const,
      id: p.id,
      date: p.practicedAt,
      location:
        p.locationName ||
        PRACTICE_LOCATION_LABELS[p.location] ||
        p.location,
      durationMin: p.durationMin,
      itemCount: p._count.items,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const hasRecentRound = recentRounds.some(
    (r) => r.playedAt >= sevenDaysAgo
  );
  const hasRecentPractice = recentPractices.some(
    (p) => p.practicedAt >= sevenDaysAgo
  );

  const displayName = user.user_metadata?.display_name || "ゴルファー";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          こんにちは、{displayName}さん
        </h1>
        <p className="text-sm text-muted-foreground">
          練習とラウンドのサイクルを回して、スコアアップを目指しましょう。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 現在の重点テーマ */}
        <CurrentFocusCard
          area={primaryFocus?.area ?? null}
          currentLevel={primaryFocus?.currentLevel ?? null}
          targetLevel={primaryFocus?.targetLevel ?? null}
          drills={primaryFocus?.specificDrills ?? []}
        />

        {/* 次のアクション */}
        <NextActionCard
          nextRoundStrategy={nextRoundStrategy}
          hasRecentPractice={hasRecentPractice}
          hasRecentRound={hasRecentRound}
        />
      </div>

      {/* スコア推移 */}
      {trendRounds.length > 1 && (
        <ScoreTrendChart
          data={trendRounds.map((r) => ({
            playedAt: r.playedAt.toISOString(),
            totalScore: r.totalScore,
            courseName: r.courseName,
          }))}
        />
      )}

      {/* タイムライン */}
      <TimelineCard items={timelineItems} />
    </div>
  );
}
