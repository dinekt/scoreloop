import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TrainingPlanView } from "@/components/analysis/TrainingPlanView";
import type { TrainingPlanContent } from "@/lib/openai/schemas/training-plan";
import { GeneratePlanButton } from "./GeneratePlanButton";

export default async function TrainingPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 最新のトレーニングプランを取得
  const latestPlan = await prisma.trainingPlan.findFirst({
    where: { userId: user.id },
    orderBy: { weekStartDate: "desc" },
  });

  const planContent = latestPlan?.content as TrainingPlanContent | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">練習プラン</h1>
        <GeneratePlanButton />
      </div>

      {planContent ? (
        <TrainingPlanView plan={planContent} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            まだ練習プランがありません。AI分析の結果をもとにプランを生成してください。
          </p>
        </div>
      )}
    </div>
  );
}
