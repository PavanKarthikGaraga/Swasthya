import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    await connectDB();

    // Find user by UID
    const targetUser = await User.findOne({ uid }).select('-password');
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Users can only view their own profile, admins can view all
    if (user.role !== 'admin' && user.uid !== uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ user: targetUser });
  } catch (error) {
    console.error('Get user error:', error);
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

    // Find user by UID
    const targetUser = await User.findOne({ uid });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Users can only update their own profile, admins can update all
    if (user.role !== 'admin' && user.uid !== uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender',
      'address', 'profileImage', 'isActive'
    ];

    // Admins can also update role
    if (user.role === 'admin') {
      allowedFields.push('role');
    }

    // Filter body to only allowed fields
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate role if being updated
    if (updates.role && !['patient', 'doctor', 'admin'].includes(updates.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be patient, doctor, or admin' },
        { status: 400 }
      );
    }

    // Update user
    Object.assign(targetUser, updates);
    await targetUser.save();

    // Return updated user data (excluding password)
    const userResponse = {
      uid: targetUser.uid,
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      role: targetUser.role,
      phoneNumber: targetUser.phoneNumber,
      dateOfBirth: targetUser.dateOfBirth,
      gender: targetUser.gender,
      address: targetUser.address,
      profileImage: targetUser.profileImage,
      isActive: targetUser.isActive,
      isVerified: targetUser.isVerified,
      updatedAt: targetUser.updatedAt,
    };

    return NextResponse.json({
      message: 'User updated successfully',
      user: userResponse,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: any, context?: any) => {
  try {
    // Only admins can delete users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete users' },
        { status: 403 }
      );
    }

    const params = context?.params instanceof Promise ? await context.params : context?.params || {};
    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    await connectDB();

    // Find and delete user
    const deletedUser = await User.findOneAndDelete({ uid });
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
      user: {
        uid: deletedUser.uid,
        email: deletedUser.email,
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
