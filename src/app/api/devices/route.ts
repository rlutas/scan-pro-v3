import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

const SUBSCRIPTION_PLANS = {
  Basic: 2,
  Standard: 5,
  Enterprise: 10,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        devices: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const maxDevices = user.subscription?.maxDevices || SUBSCRIPTION_PLANS.Basic;

    return NextResponse.json({ 
      devices: user.devices,
      subscription: {
        maxDevices: maxDevices,
        registeredDevices: user.devices.length,
        plan: user.subscription?.plan || 'Basic',
        status: user.subscription?.status || 'active',
        nextBillingDate: user.subscription?.nextBillingDate || null
      }
    });
  } catch (error) {
    console.error("[DEVICES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, location, fingerprint, userAgent } = body;

    console.log('Received request body:', body);

    if (!name || !location || !fingerprint || !userAgent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        devices: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const maxDevices = user.subscription?.maxDevices || 2;
    console.log('Current devices:', user.devices.length, 'Max devices:', maxDevices);

    if (user.devices.length >= maxDevices) {
      return NextResponse.json({ error: "Device limit reached" }, { status: 403 });
    }

    const device = await prisma.device.create({
      data: {
        name,
        location,
        fingerprint,
        userAgent,
        userId: user.id,
        lastUsed: new Date(),
      },
    });

    console.log('Created device:', device);

    return NextResponse.json({
      device,
      subscription: {
        maxDevices,
        registeredDevices: user.devices.length + 1,
        plan: user.subscription?.plan || 'Basic',
        status: user.subscription?.status || 'active'
      }
    });

  } catch (error) {
    console.error("[DEVICES_POST] Detailed error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to add device" 
    }, { 
      status: 500 
    });
  }
} 