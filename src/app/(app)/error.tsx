"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-bold">エラーが発生しました</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "予期しないエラーが発生しました。もう一度お試しください。"}
      </p>
      <Button onClick={reset} variant="outline">
        もう一度試す
      </Button>
    </div>
  );
}
