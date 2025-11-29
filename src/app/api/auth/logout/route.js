import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request) {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });

  const response = NextResponse.json({ message: 'Logged out' });
  response.headers.set('Set-Cookie', cookie);

  return response;
}
