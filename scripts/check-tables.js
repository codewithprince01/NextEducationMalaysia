const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('Tables in database:', JSON.stringify(tables, null, 2));
  } catch (err) {
    console.error('Error fetching tables:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
