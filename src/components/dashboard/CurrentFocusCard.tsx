"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

type CurrentFocusCardProps = {
  area: string | null;
  currentLevel: string | null;
  targetLevel: string | null;
  drills: string[];
};

export function CurrentFocusCard({
  area,
  currentLevel,
  targetLevel,
  drills,
}: CurrentFocusCardProps) {
  if (!area) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            現在の重点テーマ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ラウンドのAI分析を実行すると、改善テーマが表示されます。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          現在の重点テーマ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="text-lg font-bold">{area}</h3>
        {currentLevel && targetLevel && (
          <div className="text-sm">
            <span className="text-muted-foreground">{currentLevel}</span>
            <span className="mx-2">→</span>
            <span className="font-medium text-primary">{targetLevel}</span>
          </div>
        )}
        {drills.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">練習ドリル</p>
            {drills.map((drill, i) => (
              <p key={i} className="text-sm">
                - {drill}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
