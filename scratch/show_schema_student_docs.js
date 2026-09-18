const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schema = await prisma.$queryRawUnsafe('SHOW CREATE TABLE student_documents');
  console.log(schema);
}

main().catch(console.error).finally(() => prisma.$disconnect());
