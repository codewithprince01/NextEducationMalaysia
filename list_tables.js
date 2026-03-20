const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const results = await prisma.$queryRawUnsafe("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'blogs' AND TABLE_SCHEMA = 'educationmalaysia_new'")
    console.log(JSON.stringify(results, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
