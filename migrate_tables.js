const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Identifying missing tables...")
    const sourceDb = "educationmalaysia"
    const targetDb = "educationmalaysia_new"
    
    const sourceTables = await prisma.$queryRawUnsafe(`SHOW TABLES IN ${sourceDb}`)
    const targetTables = await prisma.$queryRawUnsafe(`SHOW TABLES IN ${targetDb}`)
    
    const sourceTableNames = sourceTables.map(t => t[`Tables_in_${sourceDb}`])
    const targetTableNames = targetTables.map(t => t[`Tables_in_${targetDb}`])
    
    const missingTables = sourceTableNames.filter(t => !targetTableNames.includes(t))
    
    console.log(`Found ${missingTables.length} missing tables.`)
    
    for (const table of missingTables) {
      console.log(`Migrating table: ${table}...`)
      try {
        await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS ${targetDb}.${table} LIKE ${sourceDb}.${table}`)
        await prisma.$executeRawUnsafe(`INSERT IGNORE INTO ${targetDb}.${table} SELECT * FROM ${sourceDb}.${table}`)
      } catch (err) {
        console.error(`Failed to migrate ${table}:`, err.message)
      }
    }
    
    console.log("Migration process finished!")
  } catch (e) {
    console.error("Migration failed:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
