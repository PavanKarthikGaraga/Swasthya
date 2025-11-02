import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from './db';
import { User } from './models';
import { hashPassword, comparePassword } from './password';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export interface JWTPayload {
  uid: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token has expired', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 401);
    } else {
      throw new AuthError('Token verification failed', 401);
    }
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  await connectDB();

  const user = await User.findOne({ uid: payload.uid }).select('-password');
  if (!user) {
    throw new AuthError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AuthError('Account is deactivated', 403);
  }

  return user;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check for token in cookies (check both 'token' and 'auth_token')
  const token = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value;
  return token || null;
}

export async function requireAuth(request: NextRequest, allowedRoles?: string[]) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      throw new AuthError('No token provided', 401);
    }

    const user = await getUserFromToken(token);

    // Check role permissions if specified
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      throw new AuthError('Insufficient permissions', 403);
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Authentication failed', 401);
  }
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected auth error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Middleware function for protecting API routes
export function withAuth(
  handler: (request: NextRequest, user: any, ...args: any[]) => Promise<NextResponse> | NextResponse,
  allowedRoles?: string[]
) {
  return async (request: NextRequest, context?: any, ...restArgs: any[]) => {
    try {
      const user = await requireAuth(request, allowedRoles);
      
      // Handle Next.js 15 params Promise
      let processedContext = context;
      if (context && typeof context === 'object' && 'params' in context) {
        const params = context.params;
        if (params instanceof Promise) {
          processedContext = { ...context, params: await params };
        }
      }
      
      return await handler(request, user, processedContext, ...restArgs);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

// Re-export password functions for convenience
export { hashPassword, comparePassword };
