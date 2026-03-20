const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ids = [213, 686, 725, 771, 857, 869, 975, 1008];

  const result = await prisma.courseSpecialization.updateMany({
    where: {
      id: { in: ids.map(id => BigInt(id)) }
    },
    data: {
      status: true
    }
  });

  console.log(`Activated ${result.count} specializations.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
