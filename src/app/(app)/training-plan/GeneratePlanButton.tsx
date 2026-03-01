"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startOfWeek, format } from "date-fns";
import { Loader2, Sparkles } from "lucide-react";

export function GeneratePlanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const nextMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
    nextMonday.setDate(nextMonday.getDate() + 7);

    try {
      const res = await fetch("/api/analysis/training-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStartDate: format(nextMonday, "yyyy-MM-dd"),
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "プラン生成に失敗しました");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="mr-1 h-4 w-4" />
            プランを生成
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
