import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get CNP from query parameters
    const cnp = request.nextUrl.searchParams.get('cnp');
    
    if (!cnp) {
      return NextResponse.json(
        { error: 'CNP parameter is required' },
        { status: 400 }
      );
    }

    // Read the CSV file
    const filePath = path.join(process.cwd(), 'data/exclus - exclus.csv');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Split the content into lines and check if CNP exists
    const lines = fileContent.split('\n');
    const isExcluded = lines.some(line => {
      const [, excludedCnp] = line.split(',');
      return excludedCnp?.trim() === cnp.trim();
    });

    // Return the result
    return NextResponse.json({
      isExcluded,
      cnp,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Exclusion check error:', error);
    return NextResponse.json(
      { error: 'Failed to check exclusion status' },
      { status: 500 }
    );
  }
} 