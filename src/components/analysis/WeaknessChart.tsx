"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ScoreBreakdown = {
  teeShot: { rating: number; comment: string };
  approach: { rating: number; comment: string };
  shortGame: { rating: number; comment: string };
  putting: { rating: number; comment: string };
  courseManagement: { rating: number; comment: string };
};

const LABELS: Record<string, string> = {
  teeShot: "ティーショット",
  approach: "アプローチ",
  shortGame: "ショートゲーム",
  putting: "パッティング",
  courseManagement: "マネジメント",
};

export function WeaknessChart({ breakdown }: { breakdown: ScoreBreakdown }) {
  const data = Object.entries(breakdown).map(([key, value]) => ({
    subject: LABELS[key] || key,
    rating: value.rating,
    fullMark: 5,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">スキル評価</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
            <Radar
              dataKey="rating"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 text-sm">
              <span className="min-w-[100px] font-medium">
                {LABELS[key]}: {value.rating}/5
              </span>
              <span className="text-muted-foreground">{value.comment}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
