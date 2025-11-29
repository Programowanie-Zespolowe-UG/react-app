import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import { getUserIdFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    const userFromId = await db.users.findById(userId);
    if (!userFromId) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await db.users.findUserForAuth(userFromId.email);
    
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
        return NextResponse.json({ error: 'Invalid old password' }, { status: 401 });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.users.update(userId, { passwordHash });

    return NextResponse.json({ message: 'Password updated successfully' });
}
