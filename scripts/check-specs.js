const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.courseSpecialization.count();
    const activeCount = await prisma.courseSpecialization.count({ where: { status: true } });
    const samples = await prisma.courseSpecialization.findMany({ take: 5, select: { name: true, slug: true, status: true } });

    console.log(JSON.stringify({
      total: Number(count),
      active: Number(activeCount),
      samples
    }, null, 2));
  } catch (error) {
    console.error("Prisma error:", error.message);
    // Try to list all model names available on prisma object
    console.log("Available models:", Object.keys(prisma).filter(k => k[0] !== '_'));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
