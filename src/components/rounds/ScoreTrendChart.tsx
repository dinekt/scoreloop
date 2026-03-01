"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ScoreTrendChartProps = {
  data: {
    playedAt: string | Date;
    totalScore: number;
    courseName: string;
  }[];
  targetScore?: number;
};

export function ScoreTrendChart({ data, targetScore }: ScoreTrendChartProps) {
  if (data.length === 0) {
    return null;
  }

  const chartData = [...data]
    .sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime())
    .map((d) => ({
      date: format(new Date(d.playedAt), "M/d"),
      score: d.totalScore,
      courseName: d.courseName,
    }));

  const scores = chartData.map((d) => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const yMin = Math.floor((minScore - 5) / 5) * 5;
  const yMax = Math.ceil((maxScore + 5) / 5) * 5;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">スコア推移</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[yMin, yMax]}
              reversed
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-md border bg-card p-2 text-sm shadow-sm">
                    <p className="font-medium">{d.courseName}</p>
                    <p>
                      {d.date}: <span className="font-bold">{d.score}</span>
                    </p>
                  </div>
                );
              }}
            />
            {targetScore && (
              <ReferenceLine
                y={targetScore}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                label={{ value: `目標: ${targetScore}`, fontSize: 11 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
