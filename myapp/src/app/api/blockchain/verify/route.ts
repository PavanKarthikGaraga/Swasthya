import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { aiMLClient } from '@/lib/ai-ml-client';

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId parameter is required' },
        { status: 400 }
      );
    }

    // Check if blockchain service is available
    const isServiceAvailable = await aiMLClient.isServiceAvailable();
    if (!isServiceAvailable) {
      return NextResponse.json(
        { error: 'Blockchain verification service is currently unavailable' },
        { status: 503 }
      );
    }

    // Verify record integrity
    const verificationResult = await aiMLClient.verifyMedicalRecord(fileId);

    if (!verificationResult) {
      return NextResponse.json(
        {
          verified: false,
          message: 'Record verification failed or record not found in blockchain',
          fileId
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: 'Medical record integrity verified',
      fileId,
      verificationDetails: verificationResult,
      verifiedBy: user.uid,
      verifiedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Blockchain verification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify medical record',
        details: error.message,
        verified: false
      },
      { status: 500 }
    );
  }
});
