"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export function AnalyzeButton({ roundId }: { roundId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rounds/${roundId}/analyze`, {
        method: "POST",
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || "分析に失敗しました");
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
      <Button onClick={handleAnalyze} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            AI分析中...
          </>
        ) : (
          <>
            <Sparkles className="mr-1 h-4 w-4" />
            AI分析を実行
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
