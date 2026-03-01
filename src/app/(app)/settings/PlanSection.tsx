"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS, PLAN_PRICES } from "@/lib/constants/plans";
import { Check, Loader2 } from "lucide-react";

type PlanSectionProps = {
  currentPlan: string;
  hasStripeCustomer: boolean;
};

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ["月2ラウンド記録", "基本統計のみ"],
  STANDARD: [
    "無制限ラウンド分析",
    "AI改善レポート",
    "練習ログ",
  ],
  PRO: [
    "Standard全機能",
    "AIトレーニングプラン",
    "ループダッシュボード",
    "コース別攻略",
    "データエクスポート",
  ],
};

export function PlanSection({ currentPlan, hasStripeCustomer }: PlanSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: "STANDARD" | "PRO") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.success && json.data.url) {
        window.location.href = json.data.url;
      }
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success && json.data.url) {
        window.location.href = json.data.url;
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>プラン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">現在のプラン:</span>
          <Badge className="text-sm">
            {PLAN_LABELS[currentPlan] || currentPlan}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(["FREE", "STANDARD", "PRO"] as const).map((plan) => (
            <div
              key={plan}
              className={`rounded-lg border p-4 ${
                currentPlan === plan ? "border-primary bg-primary/5" : ""
              }`}
            >
              <h3 className="font-semibold">{PLAN_LABELS[plan]}</h3>
              <p className="mt-1 text-2xl font-bold">
                {PLAN_PRICES[plan] === 0
                  ? "無料"
                  : `¥${PLAN_PRICES[plan].toLocaleString()}`}
                {PLAN_PRICES[plan] > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /月
                  </span>
                )}
              </p>
              <ul className="mt-3 space-y-1">
                {PLAN_FEATURES[plan]?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-sm">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {currentPlan === plan ? (
                <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
                  現在のプラン
                </Button>
              ) : plan !== "FREE" ? (
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading !== null}
                >
                  {loading === plan ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : null}
                  アップグレード
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        {hasStripeCustomer && (
          <Button
            variant="outline"
            onClick={handleManage}
            disabled={loading !== null}
          >
            {loading === "portal" && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            サブスクリプション管理
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
