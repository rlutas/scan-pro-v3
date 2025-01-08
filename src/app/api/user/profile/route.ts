import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            maxDevices: true,
            nextBillingDate: true,
            startDate: true,
            stripeCustomerId: true
          }
        },
        devices: {
          orderBy: {
            lastUsed: 'desc'
          }
        }
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      cui: user.cui,
      subscription: user.subscription
        ? {
            id: user.subscription.id,
            plan: user.subscription.plan,
            status: user.subscription.status,
            maxDevices: user.subscription.maxDevices,
            nextBillingDate: user.subscription.nextBillingDate,
            startDate: user.subscription.startDate,
            stripeCustomerId: user.subscription.stripeCustomerId
          }
        : null,
      devices: user.devices.map(device => ({
        id: device.id,
        name: device.name,
        location: device.location,
        lastUsed: device.lastUsed,
        isActive: device.isActive
      }))
    });
  } catch (error) {
    console.error("[USER_PROFILE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, companyName, cui } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        companyName,
        cui,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PROFILE_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 