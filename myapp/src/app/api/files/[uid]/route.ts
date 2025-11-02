import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Report } from '@/lib/models';
import { withAuth } from '@/lib/auth';
import { downloadFromGridFS, downloadFromGridFSStream } from '@/lib/gridfs';
import mongoose from 'mongoose';

export const GET = withAuth(async (request: NextRequest, user: any, { params }: { params: { uid: string } }) => {
  try {
    const { uid } = params;

    const { connection, bucket } = await connectDB();

    // Find the report
    const report = await Report.findOne({ uid });
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (user.role === 'patient') {
      // Patients can only access their own reports
      // This would need to be implemented based on your user-patient relationship
      // For now, allowing access - implement proper checks as needed
    } else if (user.role === 'doctor') {
      // Doctors can access reports they created or for their patients
      if (report.doctorId && report.doctorId.toString() !== user.doctorId) {
        // Check if doctor has access to this patient's records
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }
    // Admins have full access

    let fileBuffer: Buffer;
    let contentType: string;
    let filename: string;

    if (report.gridFSId) {
      // Download from GridFS
      const gridFSId = new mongoose.Types.ObjectId(report.gridFSId);
      fileBuffer = await downloadFromGridFS(bucket!, gridFSId);
      contentType = report.fileType;
      filename = report.fileName;
    } else if (report.fileData) {
      // Fallback to embedded file data
      fileBuffer = report.fileData;
      contentType = report.fileType;
      filename = report.fileName;
    } else {
      return NextResponse.json(
        { error: 'File data not found' },
        { status: 404 }
      );
    }

    // Return file as response
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });

    return response;

  } catch (error: any) {
    console.error('File download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
});
