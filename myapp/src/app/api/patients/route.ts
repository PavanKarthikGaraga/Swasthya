import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Patient, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    if (search) {
      // Search in associated user data
      const userIds = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).distinct('_id');

      query.userId = { $in: userIds };
    }

    // Patients can only see their own profile, doctors and admins can see all
    if (user.role === 'patient') {
      const patientUser = await User.findOne({ uid: user.uid });
      if (patientUser) {
        query.userId = patientUser._id;
      } else {
        return NextResponse.json({ patients: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
    }

    const skip = (page - 1) * limit;

    const patients = await Patient.find(query)
      .populate('userId', 'uid email firstName lastName phoneNumber role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Patient.countDocuments(query);

    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Only admins and doctors can create patient profiles
    if (!['admin', 'doctor'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      userId,
      emergencyContact,
      medicalHistory,
      insurance,
      preferredLanguage,
      bloodType,
      height,
      weight,
      smokingStatus,
      alcoholConsumption,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists and is a patient
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (targetUser.role !== 'patient') {
      return NextResponse.json(
        { error: 'User must have patient role' },
        { status: 400 }
      );
    }

    // Check if patient profile already exists
    const existingPatient = await Patient.findOne({ userId });
    if (existingPatient) {
      return NextResponse.json(
        { error: 'Patient profile already exists for this user' },
        { status: 409 }
      );
    }

    // Generate unique UID
    const uid = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create patient profile
    const patient = new Patient({
      uid,
      userId,
      emergencyContact,
      medicalHistory,
      insurance,
      preferredLanguage: preferredLanguage || 'English',
      bloodType,
      height,
      weight,
      smokingStatus,
      alcoholConsumption,
    });

    await patient.save();

    // Populate user data for response
    await patient.populate('userId', 'uid email firstName lastName phoneNumber role');

    return NextResponse.json({
      message: 'Patient profile created successfully',
      patient,
    });
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
