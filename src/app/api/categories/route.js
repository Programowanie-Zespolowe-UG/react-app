import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const categories = await db.categories.getAll(userId);
  return NextResponse.json(categories);
}

export async function POST(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { name, type } = body;
  
  if (!name || !type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newCategory = await db.categories.create({ name, type }, userId);
  return NextResponse.json(newCategory, { status: 201 });
}
