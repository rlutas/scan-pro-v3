import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { extractCNPInfo } from '@/lib/cnpUtils';
import { promises as fs } from 'fs';
import path from 'path';
import { parse as csvParse } from 'csv-parse/sync';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cnp } = await request.json();
    if (!cnp) {
      return NextResponse.json({ error: 'CNP is required' }, { status: 400 });
    }

    // Read and parse the exclusion list
    const csvPath = path.join(process.cwd(), 'data/exclus - exclus.csv');
    const fileContent = await fs.readFile(csvPath, 'utf-8');
    const records = csvParse(fileContent, {
      delimiter: ',',
      columns: true,
      skip_empty_lines: true
    });

    // Check if CNP is in exclusion list
    const isExcluded = records.some((record: any) => record.CNP === cnp);
    
    if (isExcluded) {
      return NextResponse.json({
        isAllowed: false,
        reason: "This person is self-excluded.",
        cnpInfo: extractCNPInfo(cnp)
      });
    }

    // If not excluded, return success with CNP info
    const cnpInfo = extractCNPInfo(cnp);
    if (!cnpInfo) {
      return NextResponse.json({
        isAllowed: false,
        reason: "Invalid CNP format or checksum."
      });
    }

    return NextResponse.json({
      isAllowed: true,
      cnpInfo
    });

  } catch (error) {
    console.error('Error verifying CNP:', error);
    return NextResponse.json(
      { error: 'Failed to verify CNP' },
      { status: 500 }
    );
  }
} 