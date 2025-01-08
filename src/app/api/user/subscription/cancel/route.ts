import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/utils/prismaDB";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user?.subscription?.stripeCustomerId) {
      return new NextResponse("No active subscription found", { status: 404 });
    }

    // Cancel the subscription in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.subscription.stripeCustomerId,
      status: 'active',
    });

    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id);
    }

    // Update subscription status in database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'cancelled',
        nextBillingDate: null,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[SUBSCRIPTION_CANCEL]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 