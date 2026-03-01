"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Target, Clock } from "lucide-react";

type TimelineItem =
  | {
      type: "round";
      id: string;
      date: Date;
      courseName: string;
      totalScore: number;
    }
  | {
      type: "practice";
      id: string;
      date: Date;
      location: string;
      durationMin: number;
      itemCount: number;
    };

export function TimelineCard({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          最近のアクティビティ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.type === "round" ? `/rounds/${item.id}` : `/practices/${item.id}`}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent/50"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  item.type === "round"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {item.type === "round" ? (
                  <Flag className="h-4 w-4" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {item.type === "round"
                      ? item.courseName
                      : item.location}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {item.type === "round" ? "ラウンド" : "練習"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(item.date, "M/d (E)", { locale: ja })}
                  {item.type === "round"
                    ? ` - スコア ${item.totalScore}`
                    : ` - ${item.durationMin}分 (${item.itemCount}項目)`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
