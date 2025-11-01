import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Image, Report, Patient, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const reportId = searchParams.get('reportId');
    const patientId = searchParams.get('patientId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};

    if (reportId) query.reportId = reportId;
    if (patientId) query.patientId = patientId;
    if (category) query.category = category;
    if (status) query.status = status;

    // Filter based on user role
    if (user.role === 'patient') {
      // Find patient's profile
      const patient = await Patient.findOne({ 'userId.uid': user.uid });
      if (patient) {
        query.patientId = patient._id;
      } else {
        return NextResponse.json({ images: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
    }
    // Doctors and admins can see images for patients they have access to

    const skip = (page - 1) * limit;

    const images = await Image.find(query)
      .populate('reportId', 'uid title type')
      .populate('patientId', 'uid userId')
      .populate('patientId.userId', 'firstName lastName email')
      .select('-fileData') // Exclude binary data from list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments(query);

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Only doctors and admins can upload images
    if (!['doctor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only doctors can upload images' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const reportId = formData.get('reportId') as string;
    const patientId = formData.get('patientId') as string;
    const caption = formData.get('caption') as string;
    const altText = formData.get('altText') as string;
    const category = formData.get('category') as string;
    const isPrimary = formData.get('isPrimary') === 'true';
    const order = parseInt(formData.get('order') as string) || 0;

    // Validate required fields
    if (!file || !reportId || !patientId || !category) {
      return NextResponse.json(
        { error: 'file, reportId, patientId, and category are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find report
    const report = await Report.findOne({ uid: reportId });
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Find patient
    const patient = await Patient.findOne({ uid: patientId });
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['xray', 'mri', 'ct_scan', 'ultrasound', 'photograph', 'diagram', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid image category' },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary images for this report
    if (isPrimary) {
      await Image.updateMany(
        { reportId: report._id },
        { isPrimary: false }
      );
    }

    // Read file data
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate unique UID
    const uid = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create image
    const image = new Image({
      uid,
      reportId: report._id,
      patientId: patient._id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: fileBuffer,
      caption,
      altText,
      category,
      isPrimary,
      order,
      status: 'active',
    });

    await image.save();

    // Populate data for response (excluding file data)
    await image.populate('reportId', 'uid title type');
    await image.populate('patientId', 'uid userId');
    await image.populate('patientId.userId', 'firstName lastName email');

    const responseImage = image.toObject();
    delete responseImage.fileData; // Remove binary data from response

    return NextResponse.json({
      message: 'Image uploaded successfully',
      image: responseImage,
    });
  } catch (error) {
    console.error('Create image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
