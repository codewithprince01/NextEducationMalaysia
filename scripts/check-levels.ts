import { prisma } from '../src/lib/db'

async function main() {
  const sample = await prisma.universityProgram.findFirst({
    select: { level: true }
  })
  console.log('Sample UniversityProgram.level:', sample?.level)
  
  const levelSample = await prisma.level.findFirst({
    select: { level: true, slug: true }
  })
  console.log('Sample Level:', levelSample)
}

main()
