import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        message: "You must be logged in to upgrade your subscription"
      }, { 
        status: 401 
      });
    }

    // Get user from database to get the ID
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        message: "Unable to find user account"
      }, { 
        status: 404 
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });

    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json({
        success: false,
        error: "Missing price ID",
        message: "Please select a subscription plan"
      }, { 
        status: 400 
      });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          userId: user.id
        }
      });
      stripeCustomerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        userId: user.id,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({
      success: false,
      error: "Payment initialization failed",
      message: error instanceof Error ? error.message : "Failed to start checkout process"
    }, { 
      status: 500 
    });
  }
}
