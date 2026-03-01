import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/supabase/auth-helpers";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_PLANS } from "@/lib/stripe/plans";

// POST /api/stripe/checkout - Checkout Session作成
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const body = await request.json();
  const plan = body.plan as "STANDARD" | "PRO";

  if (!plan || !STRIPE_PLANS[plan]) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_PLAN", message: "無効なプランです" } },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "ユーザーが見つかりません" } },
      { status: 404 }
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.stripeCustomerId || undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    line_items: [
      {
        price: STRIPE_PLANS[plan].priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/settings?checkout=success`,
    cancel_url: `${appUrl}/settings?checkout=cancel`,
    metadata: {
      userId: auth.userId,
      plan,
    },
  });

  return NextResponse.json({
    success: true,
    data: { url: session.url },
  });
}
