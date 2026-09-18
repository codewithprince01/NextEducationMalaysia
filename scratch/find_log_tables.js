const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const logTables = await prisma.$queryRawUnsafe(`SHOW TABLES LIKE '%log%'`);
    console.log('Log tables:', logTables);

    const allTables = await prisma.$queryRawUnsafe(`SHOW TABLES`);
    console.log('All tables count:', allTables.length);
    console.log('All tables:', allTables.map(t => Object.values(t)[0]).filter(t => t.includes('log') || t.includes('audit') || t.includes('admin') || t.includes('history')));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
