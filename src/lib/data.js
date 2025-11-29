import prisma from './prisma';

export const db = {
  users: {
    create: (email, passwordHash) => prisma.user.create({ data: { email, passwordHash } }),
    findByEmail: (email) => prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, createdAt: true } }),
    findUserForAuth: (email) => prisma.user.findUnique({ where: { email } }),
    findById: (id) => prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, createdAt: true } }),
    update: (id, data) => prisma.user.update({ where: { id }, data }),
  },
  categories: {
    getAll: (userId) => prisma.category.findMany({ where: { OR: [{ userId: null }, { userId }] } }),
    create: (data, userId) => prisma.category.create({ data: { ...data, userId } }),
    update: (id, data, userId) => prisma.category.update({ where: { id: Number(id), userId }, data }),
    delete: (id, userId) => prisma.category.delete({ where: { id: Number(id), userId } }),
  },
  entries: {
    getAll: (userId) => prisma.entry.findMany({ where: { userId }, include: { category: true } }),
    getById: (id, userId) => prisma.entry.findUnique({ where: { id: Number(id), userId }, include: { category: true } }),
    create: (data, userId) => {
        return prisma.entry.create({
            data: {
                amount: data.amount,
                date: data.date,
                description: data.description,
                categoryId: Number(data.category_id),
                userId,
            }
        });
    },
    update: (id, data, userId) => {
        const { category_id, ...rest } = data;
        const updateData = { ...rest };
        if (category_id) {
            updateData.categoryId = Number(category_id);
        }
        return prisma.entry.update({ where: { id: Number(id), userId }, data: updateData });
    },
    delete: (id, userId) => prisma.entry.delete({ where: { id: Number(id), userId } }),
  },
};
