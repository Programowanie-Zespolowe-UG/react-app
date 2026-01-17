import { NextResponse } from 'next/server';
import { db } from '@/lib/data';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  
  try {
    const updated = await db.categories.update(id, body, userId);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Category not found or not editable' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  try {
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
    }
    const { force, reassignTo } = body;

    const count = await prisma.entry.count({
      where: {
        categoryId: id,
      }
    });

    if (count > 0 && !force && !reassignTo) {
      return NextResponse.json({ error: 'RELATION_EXISTS', count }, { status: 409 });
    }

    if (force) {
      await prisma.$transaction([
        prisma.entry.deleteMany({ where: { categoryId: id } }),
        prisma.category.delete({ where: { id, userId } })
      ]);
    } else if (reassignTo === 'other') {
      const currentCategory = await prisma.category.findUnique({
        where: { id, userId }
      });

      if (!currentCategory) {
         return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      let otherCategory = await prisma.category.findFirst({
        where: { name: 'Other', userId: null, type: currentCategory.type }
      });

      if (!otherCategory) {
        otherCategory = await prisma.category.create({
          data: {
            name: 'Other',
            type: currentCategory.type,
            userId: null
          }
        });
      }

      await prisma.$transaction([
        prisma.entry.updateMany({
          where: { categoryId: id },
          data: { categoryId: otherCategory.id }
        }),
        prisma.category.delete({ where: { id, userId } })
      ]);
    } else {
      await prisma.category.delete({ where: { id, userId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Category not found or cannot be deleted' }, { status: 400 });
  }
}
