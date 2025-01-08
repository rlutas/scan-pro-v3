import { NextResponse } from "next/server";
import { performOCR } from '@/lib/ocrService';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { image } = data;

    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    const result = await performOCR(image);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
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