import { NextRequest, NextResponse } from 'next/server';
import { aiMLClient } from '@/lib/ai-ml-client';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    const { symptoms, description } = body;

    // Validate required fields
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Allow all authenticated users to analyze symptoms (patients can self-assess)
    // But doctors and admins get priority processing

    // Check if AI service is available
    const isAvailable = await aiMLClient.isServiceAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'AI symptom analysis service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Perform AI symptom analysis
    const analysis = await aiMLClient.analyzeSymptoms(symptoms, description);

    return NextResponse.json({
      success: true,
      analysis,
      disclaimer: 'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.',
      performedBy: {
        uid: user.uid,
        role: user.role,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('AI symptom analysis error:', error);
    return NextResponse.json(
      {
        error: 'AI symptom analysis failed',
        details: error.message,
        fallback: {
          message: 'AI analysis is temporarily unavailable. Please consult with a healthcare professional.',
          suggestions: [
            'Describe your symptoms in detail to a doctor',
            'Schedule an appointment for proper evaluation',
            'Keep track of when symptoms started and any patterns'
          ]
        }
      },
      { status: 500 }
    );
  }
});
