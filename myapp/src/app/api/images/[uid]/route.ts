import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Image, Patient, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    await connectDB();

    // Find image by UID
    const image = await Image.findOne({ uid });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check access permissions - populate first to get userId
    const populatedPatient = await Patient.findById(image.patientId);
    const patientUser = populatedPatient ? await User.findById(populatedPatient.userId) : null;
    const isPatient = user.role === 'patient' && user.uid === patientUser?.uid;
    const isDoctor = user.role === 'doctor';
    const isAdmin = user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (download) {
      // Return file for download/view
      return new NextResponse(image.fileData, {
        headers: {
          'Content-Type': image.fileType,
          'Content-Disposition': download ? `attachment; filename="${image.fileName}"` : 'inline',
          'Content-Length': image.fileSize.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    } else {
      // Return image metadata
      await image.populate('reportId', 'uid title type');
      await image.populate('patientId', 'uid userId');
      await image.populate('patientId.userId', 'firstName lastName email');

      const responseImage = image.toObject();
      delete responseImage.fileData; // Remove binary data from response

      return NextResponse.json({ image: responseImage });
    }
  } catch (error) {
    console.error('Get image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user: any, { params }: { params: { uid: string } }) => {
  try {
    const { uid } = params;

    await connectDB();

    // Find image by UID
    const image = await Image.findOne({ uid });
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check access permissions - only doctors and admins can update images
    const isDoctor = user.role === 'doctor';
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

      // Read file data
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      updates.fileData = fileBuffer;
      updates.fileName = file.name;
      updates.fileType = file.type;
      updates.fileSize = file.size;
    }

    // Handle other field updates
    const allowedFields = [
      'caption', 'altText', 'category', 'isPrimary', 'order', 'status'
    ];

    for (const field of allowedFields) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'isPrimary') {
          updates[field] = value === 'true';

          // If setting as primary, unset other primary images for this report
          if (updates[field]) {
            await Image.updateMany(
              { reportId: image.reportId, uid: { $ne: uid } },
              { isPrimary: false }
            );
          }
        } else if (field === 'order') {
          updates[field] = parseInt(value as string) || 0;
        } else {
          updates[field] = value;
        }
      }
    }

    // Validate category if provided
    if (updates.category) {
      const validCategories = ['xray', 'mri', 'ct_scan', 'ultrasound', 'photograph', 'diagram', 'other'];
      if (!validCategories.includes(updates.category)) {
        return NextResponse.json(
          { error: 'Invalid image category' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (updates.status && !['active', 'archived', 'deleted'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid image status' },
        { status: 400 }
      );
    }

    // Update image
    Object.assign(image, updates);
    await image.save();

    // Populate data for response
    await image.populate('reportId', 'uid title type');
    await image.populate('patientId', 'uid userId');
    await image.populate('patientId.userId', 'firstName lastName email');

    const responseImage = image.toObject();
    delete responseImage.fileData; // Remove binary data from response

    return NextResponse.json({
      message: 'Image updated successfully',
      image: responseImage,
    });
  } catch (error) {
    console.error('Update image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    // Only admins can delete images
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete images' },
        { status: 403 }
      );
    }

    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;

    await connectDB();

    // Find and delete image
    const deletedImage = await Image.findOneAndDelete({ uid });
    if (!deletedImage) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Image deleted successfully',
      image: {
        uid: deletedImage.uid,
        fileName: deletedImage.fileName,
        reportId: deletedImage.reportId,
        patientId: deletedImage.patientId,
      },
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
