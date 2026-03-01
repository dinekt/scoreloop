"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PRACTICE_LOCATION_LABELS,
  PRACTICE_CATEGORY_LABELS,
} from "@/lib/constants/golf";
import { Calendar, MapPin, Clock, Star } from "lucide-react";

type PracticeSummaryCardProps = {
  id: string;
  practicedAt: string | Date;
  location: string;
  locationName: string | null;
  durationMin: number;
  feelRating: number | null;
  items: { category: string; ballCount: number | null }[];
};

export function PracticeSummaryCard({
  id,
  practicedAt,
  location,
  locationName,
  durationMin,
  feelRating,
  items,
}: PracticeSummaryCardProps) {
  const date = new Date(practicedAt);

  return (
    <Link href={`/practices/${id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(date, "yyyy/MM/dd (E)", { locale: ja })}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {locationName || PRACTICE_LOCATION_LABELS[location] || location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {durationMin}分
              </div>
              {feelRating && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < feelRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {items.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {PRACTICE_CATEGORY_LABELS[item.category] || item.category}
                {item.ballCount ? ` ${item.ballCount}球` : ""}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
