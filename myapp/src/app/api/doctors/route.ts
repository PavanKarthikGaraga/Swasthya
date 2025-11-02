import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Doctor, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

// GET endpoint - Public (anyone can view doctors)
export const GET = async (request: NextRequest) => {
  try {
    console.log('[Doctors API] GET request received - Public endpoint');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const specialization = searchParams.get('specialization');
    const available = searchParams.get('available');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = parseFloat(searchParams.get('radius') || '50'); // Default 50km radius

    // Build query
    const query: any = {};

    if (specialization) {
      query.specialization = { $in: [specialization] };
    }

    // Only filter by available if explicitly requested, otherwise show all
    // if (available === 'true') {
    //   query.isAcceptingNewPatients = true;
    // }

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

    const skip = (page - 1) * limit;

    // Fetch all doctors matching the query
    const doctorsQuery = Doctor.find(query)
      .populate('userId', 'uid email firstName lastName phoneNumber role')
      .sort({ rating: -1, totalReviews: -1 });

    // For location-based queries, we'd need to implement geospatial filtering
    // For now, we'll just return doctors (location filtering can be added later)
    if (latitude && longitude) {
      // Placeholder for location-based filtering
      // In production, use MongoDB $near or similar geospatial queries
    }

    const doctors = await doctorsQuery
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Doctor.countDocuments(query);

    console.log(`[Doctors API] Returning ${doctors.length} doctors (total: ${total})`);
    
    return NextResponse.json({
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[Doctors API] Get doctors error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
};

// POST endpoint - Requires authentication (only admins/doctors can create doctor profiles)

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Admins can create doctor profiles for any user, doctors can create their own profile
    if (user.role !== 'admin' && user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only administrators or doctors can create doctor profiles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      userId,
      licenseNumber,
      specialization,
      experience,
      education,
      certifications,
      languages,
      availability,
      consultationFee,
      hospitalAffiliation,
      bio,
    } = body;

    await connectDB();

    let targetUser;
    
    // If admin is creating, userId is required
    if (user.role === 'admin') {
      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required when creating as admin' },
          { status: 400 }
        );
      }
      targetUser = await User.findById(userId);
      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      if (targetUser.role !== 'doctor') {
        return NextResponse.json(
          { error: 'User must have doctor role' },
          { status: 400 }
        );
      }
    } else {
      // If doctor is creating their own profile, use their own userId
      targetUser = await User.findOne({ uid: user.uid });
      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      if (targetUser.role !== 'doctor') {
        return NextResponse.json(
          { error: 'User must have doctor role' },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!licenseNumber || !specialization || specialization.length === 0) {
      return NextResponse.json(
        { error: 'licenseNumber and specialization are required' },
        { status: 400 }
      );
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ userId: targetUser._id });
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor profile already exists for this user' },
        { status: 409 }
      );
    }

    // Check if license number is unique
    const existingLicense = await Doctor.findOne({ licenseNumber });
    if (existingLicense) {
      return NextResponse.json(
        { error: 'License number already exists' },
        { status: 409 }
      );
    }

    // Generate unique UID
    const uid = `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create doctor profile
    const doctor = new Doctor({
      uid,
      userId: targetUser._id,
      licenseNumber,
      specialization,
      experience: experience || 0,
      education: education || [],
      certifications: certifications || [],
      languages: languages || ['English'],
      availability: availability || [],
      consultationFee: consultationFee || 0,
      hospitalAffiliation,
      bio,
      isAcceptingNewPatients: true,
    });

    await doctor.save();

    // Populate user data for response
    await doctor.populate('userId', 'uid email firstName lastName phoneNumber role');

    return NextResponse.json({
      message: 'Doctor profile created successfully',
      doctor,
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
