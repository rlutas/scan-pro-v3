import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/utils/prismaDB";
import { Prisma } from "@prisma/client";

const ADMIN_EMAILS = ['sishuletz@gmail.com']; // Add admin emails here

interface DeviceWithStatus {
  id: string;
  isActive: boolean;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        cui: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            maxDevices: true,
            nextBillingDate: true,
          },
        },
        devices: {
          select: {
            id: true,
            isActive: true,
          },
        },
        emailVerified: true,
      },
      orderBy: [
        {
          email: 'asc',
        },
      ],
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      companyName: user.companyName,
      cui: user.cui,
      subscription: user.subscription,
      devices: {
        total: (user.devices as DeviceWithStatus[]).length,
        active: (user.devices as DeviceWithStatus[]).filter((d: DeviceWithStatus) => d.isActive).length,
      },
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 