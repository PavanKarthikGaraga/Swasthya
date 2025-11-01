import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Report, Patient, Doctor, Appointment, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter based on user role
    if (user.role === 'patient') {
      // Find patient's profile
      const patient = await Patient.findOne({ 'userId.uid': user.uid });
      if (patient) {
        query.patientId = patient._id;
      } else {
        return NextResponse.json({ reports: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
    } else if (user.role === 'doctor') {
      // Find doctor's profile
      const doctor = await Doctor.findOne({ 'userId.uid': user.uid });
      if (doctor) {
        query.doctorId = doctor._id;
      } else {
        return NextResponse.json({ reports: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
    }
    // Admins can see all reports

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate('patientId', 'uid userId')
      .populate('doctorId', 'uid userId')
      .populate('appointmentId', 'uid appointmentDate type')
      .populate('patientId.userId', 'firstName lastName email')
      .populate('doctorId.userId', 'firstName lastName email specialization')
      .select('-fileData') // Exclude binary data from list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Only doctors and admins can create reports
    if (!['doctor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only doctors can create reports' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    const appointmentId = formData.get('appointmentId') as string;
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const metadata = formData.get('metadata') as string;
    const aiAnalysis = formData.get('aiAnalysis') as string;

    // Validate required fields
    if (!file || !patientId || !title || !type) {
      return NextResponse.json(
        { error: 'file, patientId, title, and type are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find patient
    const patient = await Patient.findOne({ uid: patientId });
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Find appointment if provided
    let appointment = null;
    if (appointmentId) {
      appointment = await Appointment.findOne({ uid: appointmentId });
      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }
    }

    // Find doctor profile if user is a doctor
    let doctor = null;
    if (user.role === 'doctor') {
      doctor = await Doctor.findOne({ 'userId.uid': user.uid });
      if (!doctor) {
        return NextResponse.json(
          { error: 'Doctor profile not found' },
          { status: 404 }
        );
      }
    }

    // Validate file type (only PDFs and common medical formats)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, TXT, and image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Validate report type
    const validTypes = ['lab_result', 'imaging', 'prescription', 'discharge_summary', 'consultation_notes', 'ai_analysis'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
    }

    // Read file data
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Parse metadata and aiAnalysis if provided
    let parsedMetadata = {};
    let parsedAiAnalysis = {};

    try {
      if (metadata) parsedMetadata = JSON.parse(metadata);
      if (aiAnalysis) parsedAiAnalysis = JSON.parse(aiAnalysis);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format in metadata or aiAnalysis' },
        { status: 400 }
      );
    }

    // Generate unique UID
    const uid = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create report
    const report = new Report({
      uid,
      patientId: patient._id,
      doctorId: doctor?._id,
      appointmentId: appointment?._id,
      title,
      type,
      description,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: fileBuffer,
      metadata: parsedMetadata,
      aiAnalysis: parsedAiAnalysis,
      status: 'final',
      isConfidential: false,
    });

    await report.save();

    // Populate data for response (excluding file data)
    await report.populate('patientId', 'uid userId');
    await report.populate('doctorId', 'uid userId');
    await report.populate('appointmentId', 'uid appointmentDate type');
    await report.populate('patientId.userId', 'firstName lastName email');
    await report.populate('doctorId.userId', 'firstName lastName email specialization');

    const responseReport = report.toObject();
    delete responseReport.fileData; // Remove binary data from response

    return NextResponse.json({
      message: 'Report uploaded successfully',
      report: responseReport,
    });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
