"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WEATHER_LABELS } from "@/lib/constants/golf";
import { Flag, MapPin, Calendar } from "lucide-react";

type RoundSummaryCardProps = {
  id: string;
  playedAt: string | Date;
  courseName: string;
  totalScore: number;
  outScore: number | null;
  inScore: number | null;
  totalPutts: number | null;
  fairwayHit: number | null;
  fairwayTotal: number | null;
  girCount: number | null;
  weather?: string | null;
};

export function RoundSummaryCard({
  id,
  playedAt,
  courseName,
  totalScore,
  outScore,
  inScore,
  totalPutts,
  fairwayHit,
  fairwayTotal,
  girCount,
  weather,
}: RoundSummaryCardProps) {
  const date = new Date(playedAt);

  return (
    <Link href={`/rounds/${id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(date, "yyyy/MM/dd (E)", { locale: ja })}
                {weather && (
                  <Badge variant="secondary" className="text-xs">
                    {WEATHER_LABELS[weather] || weather}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{courseName}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{totalScore}</p>
              <p className="text-xs text-muted-foreground">
                {outScore ?? "-"} / {inScore ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md bg-muted px-2 py-1">
              <p className="text-xs text-muted-foreground">パット</p>
              <p className="font-medium">{totalPutts ?? "-"}</p>
            </div>
            <div className="rounded-md bg-muted px-2 py-1">
              <p className="text-xs text-muted-foreground">FWキープ</p>
              <p className="font-medium">
                {fairwayHit != null && fairwayTotal
                  ? `${Math.round((fairwayHit / fairwayTotal) * 100)}%`
                  : "-"}
              </p>
            </div>
            <div className="rounded-md bg-muted px-2 py-1">
              <p className="text-xs text-muted-foreground">パーオン</p>
              <p className="font-medium">
                {girCount != null ? `${Math.round((girCount / 18) * 100)}%` : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
