import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};

    if (role) query.role = role;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Only admins can see all users, others can only see their own profile
    if (user.role !== 'admin') {
      query.uid = user.uid;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Only admins can create users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      role: userRole,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      isActive = true,
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !userRole) {
      return NextResponse.json(
        { error: 'Email, firstName, lastName, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['patient', 'doctor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be patient, doctor, or admin' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique UID
    const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user
    const newUser = new User({
      uid,
      email,
      firstName,
      lastName,
      role: userRole,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      isActive,
      isVerified: false,
    });

    await newUser.save();

    // Return user data (excluding password)
    const userResponse = {
      uid: newUser.uid,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      phoneNumber: newUser.phoneNumber,
      dateOfBirth: newUser.dateOfBirth,
      gender: newUser.gender,
      address: newUser.address,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
