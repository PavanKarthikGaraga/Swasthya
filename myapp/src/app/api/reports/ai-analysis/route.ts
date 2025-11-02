import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Report, Patient, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';
import { uploadToGridFS, isGridFSAvailable } from '@/lib/gridfs';

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    const { diagnosisResult, symptoms, description, title } = body;

    if (!diagnosisResult) {
      return NextResponse.json(
        { error: 'Diagnosis result is required' },
        { status: 400 }
      );
    }

    const { connection, bucket } = await connectDB();

    // Find patient - patients can save their own reports
    const userDoc = await User.findOne({ uid: user.uid });
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let patient = await Patient.findOne({ userId: userDoc._id });
    
    // Create patient record if it doesn't exist (for first-time users)
    if (!patient) {
      patient = new Patient({
        uid: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userDoc._id,
      });
      await patient.save();
    }

    // Create a JSON report file from the diagnosis result
    const reportData = {
      title: title || `AI Analysis Report - ${new Date().toLocaleDateString()}`,
      symptoms: symptoms || [],
      description: description || '',
      diagnosis: diagnosisResult,
      generatedAt: new Date().toISOString(),
      generatedBy: user.uid,
      patientId: patient.uid,
    };

    // Convert to JSON string and create a file buffer
    const reportJson = JSON.stringify(reportData, null, 2);
    const fileBuffer = Buffer.from(reportJson, 'utf-8');
    const fileName = `ai_analysis_${Date.now()}.json`;
    const fileType = 'application/json';

    // Upload to GridFS if available, otherwise we'll skip file storage but still save the report
    let gridFSFileId: string | null = null;
    if (isGridFSAvailable(bucket)) {
      try {
        gridFSFileId = await uploadToGridFS(
          connection,
          bucket!,
          fileBuffer,
          fileName,
          fileType,
          {
            patientId: patient.uid,
            uploadedBy: user.uid,
            reportType: 'ai_analysis',
            generatedFrom: 'ai_diagnosis'
          }
        ).then(id => id.toString());
      } catch (fileError) {
        console.warn('Failed to upload report file to GridFS:', fileError);
        // Continue without file storage
      }
    }

    // Prepare AI analysis data structure
    // Convert confidence from 0-1 scale to 0-100 if needed
    const confidenceValue = diagnosisResult.confidence !== undefined 
      ? (diagnosisResult.confidence > 1 ? diagnosisResult.confidence : diagnosisResult.confidence * 100)
      : 0;
    
    const aiAnalysis = {
      summary: diagnosisResult.analysis || '',
      recommendations: diagnosisResult.suggestions?.flatMap((s: any) => 
        s.recommendations || s.medications || []
      ) || [],
      severity: confidenceValue > 80 ? 'high' :
               confidenceValue > 60 ? 'medium' : 'low',
      confidence: confidenceValue,
      analyzedAt: new Date(),
      findings: diagnosisResult.suggestions?.map((s: any) => s.description).filter(Boolean) || [],
      conditions: diagnosisResult.suggestions?.map((s: any) => s.condition).filter(Boolean) || [],
    };

    // Generate unique UID
    const uid = `ai_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create report
    const report = new Report({
      uid,
      patientId: patient._id,
      title: title || `AI Analysis - ${new Date().toLocaleDateString()}`,
      type: 'ai_analysis',
      description: description || `AI-powered symptom analysis report`,
      fileName: fileName,
      fileType: fileType,
      fileSize: fileBuffer.length,
      gridFSId: gridFSFileId || undefined,
      metadata: {
        symptoms: symptoms || [],
        testType: 'AI Symptom Analysis',
        interpretation: diagnosisResult.analysis,
        results: {
          confidence: diagnosisResult.confidence,
          suggestionCount: diagnosisResult.suggestions?.length || 0,
        }
      },
      aiAnalysis: aiAnalysis,
      status: 'final',
      isConfidential: false,
      tags: ['ai_analysis', 'symptom_diagnosis', 'generated'],
    });

    await report.save();

    // Populate data for response
    await report.populate('patientId', 'uid userId');
    await report.populate('patientId.userId', 'firstName lastName email');

    const responseReport = report.toObject();
    delete responseReport.fileData;

    return NextResponse.json({
      success: true,
      message: 'AI analysis report saved successfully',
      report: responseReport,
    });
  } catch (error: any) {
    console.error('Save AI analysis report error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

