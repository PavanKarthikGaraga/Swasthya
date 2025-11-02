import { NextRequest, NextResponse } from 'next/server';
import { aiMLClient } from '@/lib/ai-ml-client';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const patientId = formData.get('patientId') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Validate input
    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: 'Either image file or image URL is required' },
        { status: 400 }
      );
    }

    // Only doctors and admins can perform AI image analysis
    if (!['doctor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only doctors and admins can perform AI image analysis' },
        { status: 403 }
      );
    }

    // Check if AI service is available
    const isAvailable = await aiMLClient.isServiceAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'AI image analysis service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    let imageBase64: string | undefined;

    // Convert uploaded file to base64 if provided
    if (imageFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid image format. Supported formats: JPEG, PNG, GIF, WebP' },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { error: 'Image file size too large. Maximum size is 10MB' },
          { status: 400 }
        );
      }

      // Convert file to base64
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    }

    // Perform AI image analysis
    const analysis = await aiMLClient.analyzeImage({
      imageUrl,
      imageBase64,
      patientId
    });

    return NextResponse.json({
      success: true,
      analysis,
      imageInfo: {
        filename: imageFile?.name,
        size: imageFile?.size,
        type: imageFile?.type,
        url: imageUrl
      },
      performedBy: {
        uid: user.uid,
        role: user.role,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('AI image analysis error:', error);
    return NextResponse.json(
      {
        error: 'AI image analysis failed',
        details: error.message,
        fallback: {
          message: 'AI image analysis is temporarily unavailable. Please consult with a radiologist for accurate interpretation.',
          suggestions: [
            'Schedule an appointment with a specialist',
            'Upload images for manual review by healthcare professionals',
            'Provide additional clinical context for better analysis'
          ]
        }
      },
      { status: 500 }
    );
  }
});
