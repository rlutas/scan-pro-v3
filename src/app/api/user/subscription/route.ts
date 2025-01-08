import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { SUBSCRIPTION_PLANS, getPlanDetails } from "@/config/subscriptionPlans";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        message: "You must be logged in to view subscription details"
      }, { 
        status: 401 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
        devices: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
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

    // If no subscription, return basic plan details
    if (!user.subscription) {
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          plan: SUBSCRIPTION_PLANS.BASIC.name,
          status: "active",
          maxDevices: SUBSCRIPTION_PLANS.BASIC.maxDevices,
          nextBillingDate: null,
          startDate: new Date().toISOString(),
          stripeCustomerId: null,
          devices: {
            total: user.devices.length,
            active: user.devices.filter(d => d.isActive).length,
          }
        }
      });
    }

    // Get plan details for the user's subscription
    const planDetails = getPlanDetails(user.subscription.plan);

    return NextResponse.json({
      success: true,
      data: {
        id: user.subscription.id,
        plan: user.subscription.plan,
        status: user.subscription.status,
        maxDevices: planDetails.maxDevices,
        nextBillingDate: user.subscription.nextBillingDate,
        startDate: user.subscription.startDate,
        stripeCustomerId: user.subscription.stripeCustomerId,
        devices: {
          total: user.devices.length,
          active: user.devices.filter(d => d.isActive).length,
        }
      }
    });
  } catch (error) {
    console.error("[USER_SUBSCRIPTION_GET]", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch subscription",
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    }, { 
      status: 500 
    });
  }
} 