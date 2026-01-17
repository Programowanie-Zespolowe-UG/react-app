import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    
    if (body.date) {
        body.date = new Date(body.date + 'T12:00:00Z');
    }
  
    try {
        const updated = await db.entries.update(id, body, userId);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating entry:', error);
        return NextResponse.json({ error: 'Entry not found or not editable' }, { status: 404 });
    }
}

export async function DELETE(request, { params }) {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    try {
        await db.entries.delete(id, userId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Entry not found or cannot be deleted' }, { status: 400 });
    }
}
