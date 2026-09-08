import { prisma } from '../src/lib/db-fresh';

async function main() {
  const unis = await prisma.$queryRawUnsafe<any[]>('SELECT id, name, uname FROM universities WHERE status = 1 LIMIT 10');
  
  for (const u of unis) {
    const cats = await prisma.$queryRawUnsafe<any[]>(
      'SELECT DISTINCT cc.id, cc.name, cc.slug FROM university_programs up JOIN course_categories cc ON up.course_category_id = cc.id WHERE up.university_id = ? AND up.status = 1 ORDER BY cc.name ASC',
      u.id
    );
    console.log(`\nUniversity: ${u.name} (${u.uname})`);
    console.log('Faculties (Categories):', cats.map(c => c.name));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
