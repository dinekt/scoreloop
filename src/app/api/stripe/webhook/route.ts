import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";
import type { Plan } from "@prisma/client";

// POST /api/stripe/webhook - Stripe Webhook受信
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as Plan | undefined;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && plan) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        const status = subscription.status;
        if (status === "active") {
          const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);
          await prisma.user.update({
            where: { id: user.id },
            data: { planExpiresAt: periodEnd },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan: "FREE",
          stripeSubscriptionId: null,
          planExpiresAt: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
