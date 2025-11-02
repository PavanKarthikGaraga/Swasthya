import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Patient, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any, context?: { params: { uid: string } }) => {
  try {
    const { uid } = context?.params || {} as { uid: string };
    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    await connectDB();

    // Find patient by UID
    const patient = await Patient.findOne({ uid })
      .populate('userId', 'uid email firstName lastName phoneNumber dateOfBirth gender role');

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const patientUser = patient.userId as any;
    if (user.role === 'patient' && user.uid !== patientUser.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user: any, context?: { params: { uid: string } }) => {
  try {
    const { uid } = context?.params || {} as { uid: string };
    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    await connectDB();

    // Find patient by UID
    const patient = await Patient.findOne({ uid });
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check access permissions - patients can update their own profile, doctors/admins can update any
    const patientUser = await User.findById(patient.userId);
    if (user.role === 'patient' && user.uid !== patientUser?.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'emergencyContact', 'medicalHistory', 'insurance', 'preferredLanguage',
      'bloodType', 'height', 'weight', 'smokingStatus', 'alcoholConsumption'
    ];

    // Filter body to only allowed fields
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate blood type if provided
    if (updates.bloodType && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(updates.bloodType)) {
      return NextResponse.json(
        { error: 'Invalid blood type' },
        { status: 400 }
      );
    }

    // Validate enum fields
    if (updates.smokingStatus && !['never', 'former', 'current'].includes(updates.smokingStatus)) {
      return NextResponse.json(
        { error: 'Invalid smoking status' },
        { status: 400 }
      );
    }

    if (updates.alcoholConsumption && !['none', 'occasional', 'moderate', 'heavy'].includes(updates.alcoholConsumption)) {
      return NextResponse.json(
        { error: 'Invalid alcohol consumption value' },
        { status: 400 }
      );
    }

    // Update patient
    Object.assign(patient, updates);
    await patient.save();

    // Populate user data for response
    await patient.populate('userId', 'uid email firstName lastName phoneNumber dateOfBirth gender role');

    return NextResponse.json({
      message: 'Patient profile updated successfully',
      patient,
    });
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    // Only admins can delete patient profiles
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete patient profiles' },
        { status: 403 }
      );
    }

    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    await connectDB();

    // Find and delete patient
    const deletedPatient = await Patient.findOneAndDelete({ uid });
    if (!deletedPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Patient profile deleted successfully',
      patient: {
        uid: deletedPatient.uid,
        userId: deletedPatient.userId,
      },
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
