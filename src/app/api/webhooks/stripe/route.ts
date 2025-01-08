import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/utils/prismaDB";
import { SUBSCRIPTION_PLANS, getPlanDetails } from "@/config/subscriptionPlans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Webhook signature verification failed.", { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Retrieve the subscription to get the price ID
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0].price.id;
        
        // Find the plan based on the price ID
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.priceId === priceId);
        
        if (!plan) {
          console.error('Invalid price ID:', priceId);
          throw new Error('Invalid price ID');
        }

        // Create or update subscription
        await prisma.subscription.upsert({
          where: {
            userId: session.metadata?.userId as string,
          },
          update: {
            plan: plan.name,
            status: 'active',
            maxDevices: plan.maxDevices,
            nextBillingDate: new Date(subscription.current_period_end * 1000),
            stripeCustomerId: subscription.customer as string,
            stripePriceId: priceId,
          },
          create: {
            userId: session.metadata?.userId as string,
            plan: plan.name,
            status: 'active',
            maxDevices: plan.maxDevices,
            nextBillingDate: new Date(subscription.current_period_end * 1000),
            stripeCustomerId: subscription.customer as string,
            stripePriceId: priceId,
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.priceId === priceId);
        
        if (!plan) {
          console.error('Invalid price ID:', priceId);
          throw new Error('Invalid price ID');
        }

        await prisma.subscription.update({
          where: {
            stripeCustomerId: subscription.customer as string,
          },
          data: {
            plan: plan.name,
            status: subscription.status,
            maxDevices: plan.maxDevices,
            nextBillingDate: new Date(subscription.current_period_end * 1000),
            stripePriceId: priceId,
          },
        });
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook error', { status: 400 });
  }
}