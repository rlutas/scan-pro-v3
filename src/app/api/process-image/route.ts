import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OCRService } from "@/lib/ocrService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Initialize OCR service
    const ocrService = new OCRService();
    
    try {
      // Process the image
      const text = await ocrService.processImage(file);

      return NextResponse.json({
        success: true,
        text: text,
      });
    } finally {
      // Always terminate the worker
      await ocrService.terminate();
    }

  } catch (error) {
    console.error("[PROCESS_IMAGE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to process image" },
      { status: 500 }
    );
  }
}

// Update config to use route handlers
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Set maximum duration to 30 seconds

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 