import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import { PlanSection } from "./PlanSection";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // ユーザーデータ取得(なければ作成)
  let user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email || "",
        displayName: authUser.user_metadata?.display_name || null,
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">設定</h1>

      <SettingsForm
        displayName={user.displayName || ""}
        averageScore={user.averageScore}
        headSpeed={user.headSpeed}
        handicap={user.handicap}
        golfStartYear={user.golfStartYear}
        homeCourseName={user.homeCourseName || ""}
      />

      <PlanSection
        currentPlan={user.plan}
        hasStripeCustomer={!!user.stripeCustomerId}
      />
    </div>
  );
}
