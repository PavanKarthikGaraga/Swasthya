import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/db';
import { User, Patient, Doctor } from '@/lib/models';
import { generateToken } from '@/lib/auth';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/error?error=${error}`);
    }

    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
    }

    // Parse state to get role
    let role = 'patient'; // default
    try {
      const stateData = JSON.parse(state || '{}');
      role = stateData.role || 'patient';
    } catch (e) {
      console.warn('Failed to parse state, using default role:', e);
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: 'Failed to get user info from Google' }, { status: 400 });
    }

    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update existing user with Google info if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.profileImage = picture;
        user.isVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      user = new User({
        uid,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role,
        googleId,
        profileImage: picture,
        isVerified: true,
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
          licenseNumber: `TEMP_${uid}`, // Temporary license, should be updated by admin
          specialization: [],
          experience: 0,
          education: [],
          languages: ['English'],
          availability: [],
          consultationFee: 0,
        });
        await doctor.save();
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      uid: user.uid,
      email: user.email,
      role: user.role,
    });

    // Redirect to frontend with token
    const redirectUrl = new URL('/auth/success', process.env.NEXTAUTH_URL);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('role', user.role);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/error?error=oauth_callback_failed`);
  }
}
