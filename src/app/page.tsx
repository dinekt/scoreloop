import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-bold">ScoreLoop</h1>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="ghost">ログイン</Button>
          </Link>
          <Link href="/signup">
            <Button>無料で始める</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          ゴルフスコアを
          <br />
          <span className="text-primary">AIで改善</span>する
        </h2>
        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
          練習とラウンドのサイクルをAIが分析。
          「何を練習すべきか」「その練習が効いたか」を可視化して、
          あなたのベストスコア更新をサポートします。
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg">無料で始める</Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">ラウンド記録</h3>
            <p className="text-sm text-muted-foreground">
              スコア、パット、フェアウェイキープ率を簡単入力。スマホでコースからも記録可能。
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI分析レポート</h3>
            <p className="text-sm text-muted-foreground">
              AIがラウンドデータを分析し、強み・弱みを特定。具体的な改善ポイントを提示。
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">練習プラン生成</h3>
            <p className="text-sm text-muted-foreground">
              分析結果に基づき、来週の練習メニューをAIが自動作成。効率的にスコアアップ。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ScoreLoop. All rights reserved.
      </footer>
    </div>
  );
}
