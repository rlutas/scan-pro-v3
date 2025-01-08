import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const scanHistory = await prisma.scanHistory.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        device: true,
      },
    });

    return NextResponse.json({
      success: true,
      scanHistory,
    });
  } catch (error) {
    console.error("[SCAN_HISTORY_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scan history" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 