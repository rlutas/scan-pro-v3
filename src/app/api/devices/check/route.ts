import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get fingerprint from query params
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get('fingerprint');

    if (!fingerprint) {
      return NextResponse.json({ error: "Fingerprint is required" }, { status: 400 });
    }

    // Check if device exists and is active
    const device = await prisma.device.findFirst({
      where: {
        fingerprint: fingerprint,
        isActive: true,
        user: {
          email: session.user.email
        }
      }
    });

    return NextResponse.json({
      isRegistered: !!device,
      deviceInfo: device ? {
        id: device.id,
        name: device.name,
        location: device.location
      } : null
    });

  } catch (error) {
    console.error("[DEVICE_CHECK]", error);
    return NextResponse.json(
      { error: "Failed to verify device" },
      { status: 500 }
    );
  }
} 