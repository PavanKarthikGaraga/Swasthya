import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Doctor, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any, { params }: { params: { uid: string } }) => {
  try {
    const { uid } = params;

    await connectDB();

    // Find doctor by UID
    const doctor = await Doctor.findOne({ uid })
      .populate('userId', 'uid email firstName lastName phoneNumber role');

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
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

    // Find doctor by UID
    const doctor = await Doctor.findOne({ uid });
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check access permissions - doctors can update their own profile, admins can update any
    const doctorUser = await User.findById(doctor.userId);
    if (user.role === 'doctor' && user.uid !== doctorUser?.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'specialization', 'experience', 'education', 'certifications', 'languages',
      'availability', 'consultationFee', 'isAcceptingNewPatients', 'hospitalAffiliation', 'bio'
    ];

    // Admins can also update license number
    if (user.role === 'admin') {
      allowedFields.push('licenseNumber');
    }

    // Filter body to only allowed fields
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate license number uniqueness if being updated
    if (updates.licenseNumber && updates.licenseNumber !== doctor.licenseNumber) {
      const existingLicense = await Doctor.findOne({
        licenseNumber: updates.licenseNumber,
        uid: { $ne: uid }
      });
      if (existingLicense) {
        return NextResponse.json(
          { error: 'License number already exists' },
          { status: 409 }
        );
      }
    }

    // Validate availability format
    if (updates.availability) {
      for (const slot of updates.availability) {
        if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(slot.dayOfWeek)) {
          return NextResponse.json(
            { error: 'Invalid day of week in availability' },
            { status: 400 }
          );
        }
        // Time format validation
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          return NextResponse.json(
            { error: 'Invalid time format in availability (use HH:MM)' },
            { status: 400 }
          );
        }
      }
    }

    // Update doctor
    Object.assign(doctor, updates);
    await doctor.save();

    // Populate user data for response
    await doctor.populate('userId', 'uid email firstName lastName phoneNumber role');

    return NextResponse.json({
      message: 'Doctor profile updated successfully',
      doctor,
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: any, { params }: { params: { uid: string } }) => {
  try {
    // Only admins can delete doctor profiles
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete doctor profiles' },
        { status: 403 }
      );
    }

    const { uid } = params;

    await connectDB();

    // Find and delete doctor
    const deletedDoctor = await Doctor.findOneAndDelete({ uid });
    if (!deletedDoctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Doctor profile deleted successfully',
      doctor: {
        uid: deletedDoctor.uid,
        userId: deletedDoctor.userId,
        licenseNumber: deletedDoctor.licenseNumber,
      },
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
