import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Report, Patient, Doctor, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    await connectDB();

    // Find report by UID
    const report = await Report.findOne({ uid });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const patientUser = await User.findById((report.patientId as any).userId);
    const doctorUser = report.doctorId ? await User.findById((report.doctorId as any).userId) : null;

    const isPatient = user.role === 'patient' && user.uid === patientUser?.uid;
    const isDoctor = user.role === 'doctor' && doctorUser && user.uid === doctorUser.uid;
    const isAdmin = user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (download) {
      // Return file for download
      return new NextResponse(report.fileData, {
        headers: {
          'Content-Type': report.fileType,
          'Content-Disposition': `attachment; filename="${report.fileName}"`,
          'Content-Length': report.fileSize.toString(),
        },
      });
    } else {
      // Return report metadata
      await report.populate('patientId', 'uid userId');
      await report.populate('doctorId', 'uid userId');
      await report.populate('appointmentId', 'uid appointmentDate type');
      await report.populate('patientId.userId', 'firstName lastName email');
      await report.populate('doctorId.userId', 'firstName lastName email specialization');

      const responseReport = report.toObject();
      delete responseReport.fileData; // Remove binary data from response

      return NextResponse.json({ report: responseReport });
    }
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;

    await connectDB();

    // Find report by UID
    const report = await Report.findOne({ uid });
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check access permissions - only doctors and admins can update reports
    const populatedDoctor = report.doctorId ? await Doctor.findById(report.doctorId) : null;
    const doctorUser = populatedDoctor ? await User.findById(populatedDoctor.userId) : null;
    const isDoctor = user.role === 'doctor' && doctorUser && user.uid === doctorUser.uid;
    const isAdmin = user.role === 'admin';

    if (!isDoctor && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const updates: any = {};

    // Handle file update
    if (file) {
      // Validate file type
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

      // Read file data
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      updates.fileData = fileBuffer;
      updates.fileName = file.name;
      updates.fileType = file.type;
      updates.fileSize = file.size;
    }

    // Handle other field updates
    const allowedFields = [
      'title', 'description', 'metadata', 'aiAnalysis', 'status',
      'isConfidential', 'tags'
    ];

    for (const field of allowedFields) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'metadata' || field === 'aiAnalysis') {
          try {
            updates[field] = JSON.parse(value as string);
          } catch (e) {
            return NextResponse.json(
              { error: `Invalid JSON format in ${field}` },
              { status: 400 }
            );
          }
        } else if (field === 'isConfidential') {
          updates[field] = value === 'true';
        } else {
          updates[field] = value;
        }
      }
    }

    // Validate status if provided
    if (updates.status && !['draft', 'final', 'archived'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid report status' },
        { status: 400 }
      );
    }

    // Update report
    Object.assign(report, updates);
    await report.save();

    // Populate data for response
    await report.populate('patientId', 'uid userId');
    await report.populate('doctorId', 'uid userId');
    await report.populate('appointmentId', 'uid appointmentDate type');
    await report.populate('patientId.userId', 'firstName lastName email');
    await report.populate('doctorId.userId', 'firstName lastName email specialization');

    const responseReport = report.toObject();
    delete responseReport.fileData; // Remove binary data from response

    return NextResponse.json({
      message: 'Report updated successfully',
      report: responseReport,
    });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    // Only admins can delete reports
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete reports' },
        { status: 403 }
      );
    }

    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;

    await connectDB();

    // Find and delete report
    const deletedReport = await Report.findOneAndDelete({ uid });
    if (!deletedReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Report deleted successfully',
      report: {
        uid: deletedReport.uid,
        title: deletedReport.title,
        patientId: deletedReport.patientId,
        doctorId: deletedReport.doctorId,
      },
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
