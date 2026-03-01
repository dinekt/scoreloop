"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PRACTICE_CATEGORY_LABELS } from "@/lib/constants/golf";
import type { TrainingPlanContent } from "@/lib/openai/schemas/training-plan";
import { Target, Clock, Dumbbell } from "lucide-react";

export function TrainingPlanView({ plan }: { plan: TrainingPlanContent }) {
  return (
    <div className="space-y-4">
      {/* 週間目標 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            今週の目標
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{plan.weeklyGoal}</p>
        </CardContent>
      </Card>

      {/* 重点エリア */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">重点エリア</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.focusAreas.map((area, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {area.priority}. {area.area}
                </span>
                <span className="text-xs text-muted-foreground">
                  時間配分 {area.timeAllocation}%
                </span>
              </div>
              <Progress value={area.timeAllocation} className="h-2" />
              <p className="text-xs text-muted-foreground">{area.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* セッション */}
      {plan.sessions.map((session, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                {session.dayOfWeek} - {session.sessionType}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {session.durationMin}分
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">
                ウォームアップ:
              </span>{" "}
              {session.warmup}
            </div>

            {session.mainDrills.map((drill, j) => (
              <div key={j} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{drill.drill}</span>
                    <Badge variant="secondary" className="text-xs">
                      {PRACTICE_CATEGORY_LABELS[drill.category] || drill.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {drill.ballCount && <span>{drill.ballCount}球</span>}
                    <span>{drill.durationMin}分</span>
                  </div>
                </div>
                <p className="mt-1 text-sm">{drill.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">成功基準:</span>{" "}
                    <span className="text-muted-foreground">{drill.successCriteria}</span>
                  </div>
                  <div>
                    <span className="font-medium">ポイント:</span>{" "}
                    <span className="text-muted-foreground">{drill.tips}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-sm">
              <span className="font-medium text-muted-foreground">
                クールダウン:
              </span>{" "}
              {session.cooldown}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* チェックポイント */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">週末チェックポイント</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">{plan.weeklyCheckpoint}</p>
          <p className="text-sm font-medium text-primary">
            {plan.connectionToNextRound}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
