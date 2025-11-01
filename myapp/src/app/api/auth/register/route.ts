import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Patient, Doctor } from '@/lib/models';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      role = 'patient',
      phoneNumber,
      dateOfBirth,
      gender
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be patient, doctor, or admin' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      uid,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      role,
      isVerified: false, // Email verification can be added later
      isActive: true,
    });

    await user.save();

    // Create corresponding profile based on role
    if (role === 'patient') {
      const patient = new Patient({
        uid: `patient_${uid}`,
        userId: user._id,
      });
      await patient.save();
    } else if (role === 'doctor') {
      const doctor = new Doctor({
        uid: `doctor_${uid}`,
        userId: user._id,
        licenseNumber: `TEMP_${uid}`, // Temporary license, should be updated
        specialization: [],
        experience: 0,
        education: [],
        languages: ['English'],
        availability: [],
        consultationFee: 0,
      });
      await doctor.save();
    }

    // Generate JWT token
    const token = generateToken({
      uid: user.uid,
      email: user.email,
      role: user.role,
    });

    // Return user data (excluding password) and token
    const userResponse = {
      uid: user.uid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      message: 'User registered successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
