import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const body = await request.json();
  
    try {
        const updated = await db.entries.update(Number(id), body, userId);
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Entry not found or not editable' }, { status: 404 });
    }
}

export async function DELETE(request, { params }) {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;

    try {
        await db.entries.delete(Number(id), userId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Entry not found or cannot be deleted' }, { status: 400 });
    }
}
