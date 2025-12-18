import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import bcrypt from 'bcryptjs';
import { parse } from 'cookie';
import crypto from 'crypto';

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'captcha-secret-key-change-me';

export async function POST(request) {
  const { email, password, captcha } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Validate Captcha
  const cookieHeader = request.headers.get('cookie');
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const captchaHash = cookies.captcha;

  if (!captchaHash || !captcha) {
     return NextResponse.json({ error: 'Captcha is required' }, { status: 400 });
  }

  const providedHash = crypto.createHmac('sha256', CAPTCHA_SECRET)
      .update(String(captcha))
      .digest('hex');

  if (providedHash !== captchaHash) {
      return NextResponse.json({ error: 'Invalid captcha' }, { status: 400 });
  }

  const existingUser = await db.users.findByEmail(email);
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await db.users.create(email, passwordHash);

  // Don't return the password hash
  const { passwordHash: _, ...userWithoutPassword } = newUser;

  return NextResponse.json(userWithoutPassword, { status: 201 });
}
