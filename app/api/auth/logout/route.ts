import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('auth_token');

  return response;
}
