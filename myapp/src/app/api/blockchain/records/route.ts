import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { aiMLClient } from '@/lib/ai-ml-client';

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId parameter is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // For patient role, ensure they can only access their own records
    if (user.role === 'patient') {
      if (patientId !== user.uid) {
        return NextResponse.json(
          { error: 'Access denied: You can only view your own medical records' },
          { status: 403 }
        );
      }
    } else if (user.role === 'doctor') {
      // Doctors can access their patients' records
      // Additional permission checks can be added here if needed
    }
    // Admins have full access

    // Check if blockchain service is available
    const isServiceAvailable = await aiMLClient.isServiceAvailable();
    if (!isServiceAvailable) {
      return NextResponse.json(
        { error: 'Blockchain records service is currently unavailable' },
        { status: 503 }
      );
    }

    // Retrieve patient records from blockchain using patientId directly
    // blockchain uses user.uid as patientId, not Patient.uid
    const blockchainRecords = await aiMLClient.getPatientRecords(patientId);

    return NextResponse.json({
      success: true,
      patientId,
      records: blockchainRecords,
      totalRecords: blockchainRecords.length,
      retrievedAt: new Date().toISOString(),
      retrievedBy: {
        uid: user.uid,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Blockchain records retrieval error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve blockchain medical records',
        details: error.message,
        records: [],
        totalRecords: 0
      },
      { status: 500 }
    );
  }
});
