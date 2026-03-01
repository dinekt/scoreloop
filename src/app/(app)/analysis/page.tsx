import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calendar } from "lucide-react";

const REPORT_TYPE_LABELS: Record<string, string> = {
  ROUND_ANALYSIS: "ラウンド分析",
  TREND_ANALYSIS: "トレンド分析",
  PRACTICE_IMPACT: "練習効果分析",
};

export default async function AnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const reports = await prisma.analysisReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      round: { select: { courseName: true, totalScore: true, playedAt: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI分析レポート</h1>

      {reports.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            まだ分析レポートがありません。ラウンド詳細ページからAI分析を実行してください。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={report.roundId ? `/rounds/${report.roundId}` : "#"}
            >
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">
                        {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                      </Badge>
                    </div>
                    {report.round && (
                      <p className="text-sm font-medium">
                        {report.round.courseName} - {report.round.totalScore}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(report.createdAt, "yyyy/MM/dd", { locale: ja })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
