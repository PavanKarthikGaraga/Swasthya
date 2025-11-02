import { NextRequest, NextResponse } from 'next/server';
import { AIMLClient } from '@/lib/ai-ml-client';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    const labels = formData.get('labels') ? JSON.parse(formData.get('labels') as string) : [];
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {};

    if (!file || !patientId) {
      return NextResponse.json(
        { error: 'File and patientId are required' },
        { status: 400 }
      );
    }

    const aiClient = new AIMLClient();
    
    // Upload file to blockchain backend
    const uploadResponse = await aiClient.uploadMedicalRecord(file, patientId, metadata, labels, tags);

    if (!uploadResponse) {
      return NextResponse.json(
        { error: 'File upload to blockchain failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Medical record stored successfully',
      data: uploadResponse,
      uploadedBy: {
        uid: user.uid,
        role: user.role,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Blockchain store error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});
