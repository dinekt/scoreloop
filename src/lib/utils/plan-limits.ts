import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/constants/plans";
import type { Plan } from "@prisma/client";

/**
 * Check if user has reached the monthly round limit for their plan.
 */
export async function checkRoundLimit(
  userId: string,
  plan: Plan
): Promise<{ allowed: boolean; current: number; max: number }> {
  const limits = PLAN_LIMITS[plan];
  if (limits.maxRoundsPerMonth === Infinity) {
    return { allowed: true, current: 0, max: Infinity };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await prisma.round.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    allowed: count < limits.maxRoundsPerMonth,
    current: count,
    max: limits.maxRoundsPerMonth,
  };
}

/**
 * Check if a feature is available for the given plan.
 */
export function checkFeatureAccess(
  plan: Plan,
  feature: keyof (typeof PLAN_LIMITS)["FREE"]
): boolean {
  return !!PLAN_LIMITS[plan][feature];
}
