import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { RoundSummaryCard } from "@/components/rounds/RoundSummaryCard";
import { ScoreTrendChart } from "@/components/rounds/ScoreTrendChart";
import { Plus } from "lucide-react";

export default async function RoundsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const [rounds, total] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.round.count({ where: { userId: user.id } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // スコア推移用に直近20件取得
  const trendData = await prisma.round.findMany({
    where: { userId: user.id },
    orderBy: { playedAt: "desc" },
    take: 20,
    select: { playedAt: true, totalScore: true, courseName: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ラウンド一覧</h1>
        <Link href="/rounds/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            新規記録
          </Button>
        </Link>
      </div>

      {/* スコア推移グラフ */}
      {trendData.length > 1 && (
        <ScoreTrendChart
          data={trendData.map((r) => ({
            playedAt: r.playedAt.toISOString(),
            totalScore: r.totalScore,
            courseName: r.courseName,
          }))}
        />
      )}

      {/* ラウンド一覧 */}
      {rounds.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            まだラウンドの記録がありません
          </p>
          <Link href="/rounds/new" className="mt-4 inline-block">
            <Button variant="outline">最初のラウンドを記録する</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round) => (
            <RoundSummaryCard
              key={round.id}
              id={round.id}
              playedAt={round.playedAt.toISOString()}
              courseName={round.courseName}
              totalScore={round.totalScore}
              outScore={round.outScore}
              inScore={round.inScore}
              totalPutts={round.totalPutts}
              fairwayHit={round.fairwayHit}
              fairwayTotal={round.fairwayTotal}
              girCount={round.girCount}
              weather={round.weather}
            />
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/rounds?page=${page - 1}`}>
              <Button variant="outline" size="sm">
                前へ
              </Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages} ページ
          </span>
          {page < totalPages && (
            <Link href={`/rounds?page=${page + 1}`}>
              <Button variant="outline" size="sm">
                次へ
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
