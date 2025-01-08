import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/utils/prismaDB";
import { getPlanDetails } from "@/config/subscriptionPlans";

const ADMIN_EMAILS = ['sishuletz@gmail.com']; // Add admin emails here

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { plan, status } = body;
    
    // Get plan details including maxDevices
    const planDetails = getPlanDetails(plan);

    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId: params.userId,
      },
      update: {
        plan: planDetails.name,
        status,
        maxDevices: planDetails.maxDevices,
        nextBillingDate: status === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
      create: {
        userId: params.userId,
        plan: planDetails.name,
        status,
        maxDevices: planDetails.maxDevices,
        nextBillingDate: status === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("[ADMIN_UPDATE_SUBSCRIPTION]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 