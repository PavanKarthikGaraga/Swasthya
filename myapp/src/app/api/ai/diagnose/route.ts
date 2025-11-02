import { NextRequest, NextResponse } from 'next/server';
import { AIMLClient } from '@/lib/ai-ml-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, patientId, description } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    const aiClient = new AIMLClient();
    const diagnosis = await aiClient.diagnose(symptoms, patientId, description);

    if (!diagnosis) {
      return NextResponse.json(
        { error: 'AI diagnosis failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (error: any) {
    console.error('AI diagnosis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
