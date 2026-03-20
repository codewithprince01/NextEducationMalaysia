const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const data = await prisma.$queryRawUnsafe("SELECT * FROM educationmalaysia.universities WHERE name LIKE '%Akademi%'")
    console.log(JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
