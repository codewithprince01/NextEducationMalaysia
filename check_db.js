const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRawUnsafe('SHOW TABLES LIKE "page_contents"')
  console.log(JSON.stringify(result, null, 2))
  
  if (result.length > 0) {
    const describe = await prisma.$queryRawUnsafe('DESCRIBE page_contents')
    console.log(JSON.stringify(describe, null, 2))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
