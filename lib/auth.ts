import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export type UserRole = 'USER' | 'ADMIN';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UserSession extends JWTPayload {
  name?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const TOKEN_EXPIRY = '7d';

/**
 * Create a JWT token for the given payload
 */
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}

/**
 * Set the auth token cookie (for use in API routes)
 */
export function setAuthCookie(response: Response, token: string): void {
  const responseWithCookies = response as any;
  responseWithCookies.cookies?.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear the auth token cookie (for use in API routes)
 */
export function clearAuthCookie(response: Response): void {
  const responseWithCookies = response as any;
  responseWithCookies.cookies?.delete('auth_token');
}
