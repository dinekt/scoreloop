import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PRACTICE_LOCATION_LABELS,
  PRACTICE_CATEGORY_LABELS,
} from "@/lib/constants/golf";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";

export default async function PracticeDetailPage({
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

  const practice = await prisma.practice.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });

  if (!practice) {
    notFound();
  }

  const totalBalls = practice.items.reduce(
    (sum, item) => sum + (item.ballCount ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/practices">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1 h-4 w-4" />
          一覧へ
        </Button>
      </Link>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {format(practice.practicedAt, "yyyy年M月d日 (E)", {
              locale: ja,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {practice.locationName ||
                PRACTICE_LOCATION_LABELS[practice.location] ||
                practice.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {practice.durationMin}分
            </div>
            {totalBalls > 0 && (
              <span className="text-muted-foreground">
                合計 {totalBalls}球
              </span>
            )}
          </div>

          {practice.feelRating && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">手応え:</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < practice.feelRating!
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 練習項目 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">練習項目</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {practice.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {PRACTICE_CATEGORY_LABELS[item.category] || item.category}
                  </Badge>
                  {item.ballCount && (
                    <span className="text-sm text-muted-foreground">
                      {item.ballCount}球
                    </span>
                  )}
                  {item.durationMin && (
                    <span className="text-sm text-muted-foreground">
                      {item.durationMin}分
                    </span>
                  )}
                </div>
                {item.detail && (
                  <p className="text-sm">{item.detail}</p>
                )}
                {item.notes && (
                  <p className="text-xs text-muted-foreground">{item.notes}</p>
                )}
              </div>
              {item.feelRating && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < item.feelRating!
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* メモ */}
      {practice.memo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{practice.memo}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
