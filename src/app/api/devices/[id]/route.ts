import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/utils/prismaDB";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const deviceId = params.id;
    if (!deviceId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Device ID is required" }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user and check device ownership in a single query
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        user: {
          email: session.user.email
        }
      },
    });

    if (!device) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Device not found or unauthorized" }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete device
    await prisma.device.delete({
      where: {
        id: deviceId,
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Device deleted successfully",
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("[DEVICE_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: "Failed to delete device" 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 