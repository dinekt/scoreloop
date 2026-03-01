import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";
import { getStripe } from "@/lib/stripe/client";

// POST /api/stripe/portal - Customer Portal URL取得
export async function POST() {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { success: false, error: { code: "NO_SUBSCRIPTION", message: "サブスクリプションがありません" } },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({
    success: true,
    data: { url: session.url },
  });
}
