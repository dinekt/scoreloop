import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreCard } from "@/components/rounds/ScoreCard";
import { WEATHER_LABELS, WIND_LABELS } from "@/lib/constants/golf";
import { ArrowLeft, Trash2 } from "lucide-react";
import { DeleteRoundButton } from "./DeleteRoundButton";

export default async function RoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { id } = await params;

  const round = await prisma.round.findFirst({
    where: { id, userId: user.id },
    include: { holes: { orderBy: { holeNumber: "asc" } } },
  });

  if (!round) {
    notFound();
  }

  const fwPercentage =
    round.fairwayHit != null && round.fairwayTotal
      ? Math.round((round.fairwayHit / round.fairwayTotal) * 100)
      : null;
  const girPercentage =
    round.girCount != null ? Math.round((round.girCount / 18) * 100) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Link href="/rounds">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            一覧へ
          </Button>
        </Link>
        <DeleteRoundButton roundId={round.id} />
      </div>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{round.courseName}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {format(round.playedAt, "yyyy年M月d日 (E)", { locale: ja })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{round.totalScore}</p>
              <p className="text-sm text-muted-foreground">
                OUT {round.outScore ?? "-"} / IN {round.inScore ?? "-"}
              </p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            {round.weather && (
              <Badge variant="secondary">
                {WEATHER_LABELS[round.weather] || round.weather}
              </Badge>
            )}
            {round.wind && (
              <Badge variant="secondary">
                {WIND_LABELS[round.wind] || round.wind}
              </Badge>
            )}
            {round.temperature != null && (
              <Badge variant="secondary">{round.temperature}°C</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">パット</p>
              <p className="text-lg font-bold">{round.totalPutts ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">FWキープ</p>
              <p className="text-lg font-bold">
                {fwPercentage != null ? `${fwPercentage}%` : "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {round.fairwayHit ?? 0}/{round.fairwayTotal ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">パーオン</p>
              <p className="text-lg font-bold">
                {girPercentage != null ? `${girPercentage}%` : "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {round.girCount ?? 0}/18
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ペナルティ</p>
              <p className="text-lg font-bold">{round.penaltyCount ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* スコアカード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">スコアカード</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreCard
            holes={round.holes}
            outScore={round.outScore}
            inScore={round.inScore}
            totalScore={round.totalScore}
          />
        </CardContent>
      </Card>

      {/* メモ */}
      {round.memo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{round.memo}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
