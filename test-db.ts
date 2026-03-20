import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.university.count();
    console.log(`Connection successful. University count: ${count}`);
    const firstUni = await prisma.university.findFirst({ select: { name: true } });
    console.log(`First University: ${firstUni?.name}`);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
