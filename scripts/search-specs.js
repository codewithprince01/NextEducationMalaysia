const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const names = [
    "Regional Studies", "Data Analytics", "Aviation", "ACCA",
    "Special Education", "Fashion and Textile Design", 
    "Occupational Therapy", "Fashion Design"
  ];

  const results = await prisma.courseSpecialization.findMany({
    where: {
      name: { in: names }
    },
    select: { id: true, name: true, slug: true, status: true }
  });

  console.log(JSON.stringify(results, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
