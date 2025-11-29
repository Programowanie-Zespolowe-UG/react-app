import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
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
