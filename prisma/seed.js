const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const defaultCategories = [
  // Income - Predefined
  { name: 'Salary', type: 'income' },
  { name: 'Bonus', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Refunds', type: 'income' },
  { name: 'Other Income', type: 'income' },
  // Expenses - Predefined
  { name: 'Food', type: 'expense' },
  { name: 'Rent', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Subscriptions', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Health', type: 'expense' },
  { name: 'Other Expense', type: 'expense' },
];

async function main() {
  console.log('Clearing existing data...');
  await prisma.entry.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding default categories...');
  for (const category of defaultCategories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log('Seeding mock user...');
  const passwordHash = await bcrypt.hash('password', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test User',
      passwordHash,
    },
  });

  console.log('Seeding custom categories for mock user...');
  const customCategory = await prisma.category.create({
    data: {
      name: 'Gym',
      type: 'expense',
      userId: user.id,
    },
  });

  const salaryCategory = await prisma.category.findFirst({
      where: { name: 'Salary' }
  });

  const freelanceCategory = await prisma.category.findFirst({ where: { name: 'Freelance' }});
  const foodCategory = await prisma.category.findFirst({ where: { name: 'Food' }});
  const shoppingCategory = await prisma.category.findFirst({ where: { name: 'Shopping' }});
  const transportCategory = await prisma.category.findFirst({ where: { name: 'Transport' }});

  console.log('Seeding entries for mock user...');
  if (salaryCategory) {
    await prisma.entry.create({
        data: {
        amount: 5000,
        date: new Date(),
        description: 'Monthly Salary',
        categoryId: salaryCategory.id,
        userId: user.id,
        },
    });
  }

  if (freelanceCategory) {
    await prisma.entry.create({
        data: {
        amount: 800,
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        description: 'Web design project',
        categoryId: freelanceCategory.id,
        userId: user.id,
        },
    });
  }

  if (foodCategory) {
    await prisma.entry.create({
        data: {
        amount: 75.50,
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        description: 'Groceries for the week',
        categoryId: foodCategory.id,
        userId: user.id,
        },
    });
  }

  if (shoppingCategory) {
    await prisma.entry.create({
        data: {
        amount: 250,
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        description: 'New shoes',
        categoryId: shoppingCategory.id,
        userId: user.id,
        },
    });
  }

  if (transportCategory) {
    await prisma.entry.create({
        data: {
        amount: 45,
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        description: 'Monthly bus pass',
        categoryId: transportCategory.id,
        userId: user.id,
        },
    });
  }

  await prisma.entry.create({
    data: {
      amount: 150,
      date: new Date(),
      description: 'Gym Membership',
      categoryId: customCategory.id,
      userId: user.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });