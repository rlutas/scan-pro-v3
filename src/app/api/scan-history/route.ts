import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        data: [],
        message: 'You must be logged in to perform this action'
      }, { 
        status: 401 
      });
    }

    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        data: [],
        message: 'User account not found'
      }, { 
        status: 404 
      });
    }

    console.log('Fetching scan history for user:', user.id);

    const scanHistory = await prisma.scanHistory.findMany({
      where: {
        userId: user.id
      },
      include: {
        device: true
      },
      orderBy: {
        scannedAt: 'desc'
      }
    });

    // Transform the data to match the frontend interface
    const transformedHistory = scanHistory.map(record => ({
      id: record.id,
      cnp: record.cnp,
      scannedAt: record.scannedAt.toISOString(),
      wasAllowed: record.wasAllowed,
      reason: record.reason,
      device: record.device ? {
        name: record.device.name,
        location: record.device.location,
        fingerprint: record.device.fingerprint,
        userAgent: record.device.userAgent
      } : {
        name: record.deviceName || 'Deleted Device',
        location: record.deviceLocation || 'Unknown Location',
        fingerprint: '',
        userAgent: ''
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedHistory,
      message: transformedHistory.length === 0 ? 'No scan history found' : 'Scan history retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch scan history',
      details: error instanceof Error ? error.message : String(error),
      data: [],
      message: 'An error occurred while fetching scan history'
    }, { 
      status: 500 
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        data: null,
        message: 'You must be logged in to perform this action'
      }, { 
        status: 401 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        data: null,
        message: 'User account not found'
      }, { 
        status: 404 
      });
    }

    const body = await request.json();
    const { cnp, isExcluded, reason, deviceId } = body;

    if (!cnp || !deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        data: null,
        message: 'CNP and device ID are required'
      }, {
        status: 400 
      });
    }

    // Get device details before creating scan record
    const device = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      return NextResponse.json({
        success: false,
        error: 'Device not found',
        data: null,
        message: 'The specified device does not exist'
      }, {
        status: 404
      });
    }

    const scanRecord = await prisma.scanHistory.create({
      data: {
        cnp,
        wasAllowed: !isExcluded,
        reason,
        userId: user.id,
        deviceId: device.id,
        deviceName: device.name,
        deviceLocation: device.location
      },
      include: {
        device: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: scanRecord.id,
        cnp: scanRecord.cnp,
        scannedAt: scanRecord.scannedAt.toISOString(),
        wasAllowed: scanRecord.wasAllowed,
        reason: scanRecord.reason,
        device: {
          name: scanRecord.device?.name || scanRecord.deviceName || 'Deleted Device',
          location: scanRecord.device?.location || scanRecord.deviceLocation || 'Unknown Location',
          fingerprint: scanRecord.device?.fingerprint || '',
          userAgent: scanRecord.device?.userAgent || ''
        }
      },
      message: 'Scan record created successfully'
    });

  } catch (error) {
    console.error('Error creating scan record:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create scan record',
      details: error instanceof Error ? error.message : String(error),
      data: null,
      message: 'An error occurred while saving the scan record'
    }, { 
      status: 500 
    });
  }
} 