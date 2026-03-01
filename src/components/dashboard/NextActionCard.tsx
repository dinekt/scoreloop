"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus } from "lucide-react";

type NextActionCardProps = {
  nextRoundStrategy: string | null;
  hasRecentPractice: boolean;
  hasRecentRound: boolean;
};

export function NextActionCard({
  nextRoundStrategy,
  hasRecentPractice,
  hasRecentRound,
}: NextActionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4" />
          次のアクション
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextRoundStrategy && (
          <div className="rounded-md bg-primary/5 p-3">
            <p className="text-sm">{nextRoundStrategy}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {!hasRecentRound && (
            <Link href="/rounds/new" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                ラウンドを記録
              </Button>
            </Link>
          )}
          {!hasRecentPractice && (
            <Link href="/practices/new" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                練習を記録
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
