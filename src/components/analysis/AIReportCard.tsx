"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeaknessChart } from "./WeaknessChart";
import { TrendingUp, TrendingDown, Minus, Target, Lightbulb } from "lucide-react";
import type { RoundAnalysis } from "@/lib/openai/schemas/round-analysis";

export function AIReportCard({ analysis }: { analysis: RoundAnalysis }) {
  return (
    <div className="space-y-4">
      {/* 総合評価 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">総合評価</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{analysis.overallAssessment}</p>
          <p className="mt-3 rounded-md bg-primary/5 p-3 text-sm font-medium text-primary">
            {analysis.motivationalComment}
          </p>
        </CardContent>
      </Card>

      {/* レーダーチャート */}
      <WeaknessChart breakdown={analysis.scoreBreakdown} />

      {/* スコアロス分析 */}
      {analysis.scoreLossAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">スコアロス分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.scoreLossAnalysis.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-muted-foreground">
                    -{item.lostStrokes}打 ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* トレンド */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">トレンド</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.trends.improving.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1 text-sm font-medium text-green-600">
                <TrendingUp className="h-4 w-4" />
                改善傾向
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.trends.improving.map((t, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-50 text-green-700">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {analysis.trends.declining.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1 text-sm font-medium text-red-600">
                <TrendingDown className="h-4 w-4" />
                悪化傾向
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.trends.declining.map((t, i) => (
                  <Badge key={i} variant="secondary" className="bg-red-50 text-red-700">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {analysis.trends.stable.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <Minus className="h-4 w-4" />
                安定
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.trends.stable.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 練習効果 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">練習効果分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{analysis.practiceImpact.observed}</p>
          {analysis.practiceImpact.correlations.length > 0 && (
            <div className="space-y-2">
              {analysis.practiceImpact.correlations.map((c, i) => (
                <div key={i} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.practice}</span>
                    <Badge
                      variant="outline"
                      className={
                        c.confidence === "high"
                          ? "border-green-500 text-green-600"
                          : c.confidence === "medium"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-gray-400 text-gray-500"
                      }
                    >
                      {c.confidence}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{c.roundImpact}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 改善プラン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            改善プラン
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-primary/20 p-4">
            <h4 className="font-semibold">
              最優先: {analysis.improvementPlan.primaryFocus.area}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {analysis.improvementPlan.primaryFocus.currentLevel} →{" "}
              {analysis.improvementPlan.primaryFocus.targetLevel}
            </p>
            <p className="mt-1 text-sm">
              期待効果: {analysis.improvementPlan.primaryFocus.expectedImpact}
            </p>
            <div className="mt-2 space-y-1">
              {analysis.improvementPlan.primaryFocus.specificDrills.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">-</span> {d}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-medium">
              次点: {analysis.improvementPlan.secondaryFocus.area}
            </h4>
            <div className="mt-2 space-y-1">
              {analysis.improvementPlan.secondaryFocus.specificDrills.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">-</span> {d}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 次回ラウンド戦略 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            次回ラウンドの戦略
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {analysis.improvementPlan.nextRoundStrategy}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
