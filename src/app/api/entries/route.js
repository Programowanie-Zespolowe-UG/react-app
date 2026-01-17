import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const entries = await db.entries.getAll(userId);
  return NextResponse.json(entries);
}

export async function POST(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { amount, date, category_id, description } = body;

  if (!amount || !date || !category_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const newEntry = await db.entries.create({
    amount: parseFloat(amount),
    date: new Date(date + 'T12:00:00Z'),
    category_id: category_id,
    description
  }, userId);

  return NextResponse.json(newEntry, { status: 201 });
}
