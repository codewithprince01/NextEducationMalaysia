const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.university.count();
    console.log('Total Universities count in Prisma:', count);

    const rawCount = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM universities');
    console.log('Raw count in universities:', rawCount);

    const websiteGroups = await prisma.$queryRawUnsafe('SELECT website, COUNT(*) as cnt FROM universities GROUP BY website');
    console.log('Website groups:', websiteGroups);

    const sql = `
      SELECT u.id, u.name, it.type as institute_type_name,
             COALESCE(up.cnt, 0) AS programs_count,
             COALESCE(uo.cnt, 0) AS overviews_count,
             COALESCE(uph.cnt, 0) AS photos_count,
             COALESCE(uv.cnt, 0) AS videos_count,
             COALESCE(uf.cnt, 0) AS facilities_count
      FROM universities u
      LEFT JOIN institute_types it ON u.institute_type = it.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_programs GROUP BY university_id) up ON up.university_id = u.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_overviews GROUP BY university_id) uo ON uo.university_id = u.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_photos GROUP BY university_id) uph ON uph.university_id = u.id
      LEFT JOIN (SELECT university_id, COUNT(*) as cnt FROM university_videos GROUP BY university_id) uv ON uv.university_id = u.id
      LEFT JOIN (SELECT u_id, COUNT(*) as cnt FROM university_facilities GROUP BY u_id) uf ON uf.u_id = u.id
      LIMIT 3
    `;
    const res = await prisma.$queryRawUnsafe(sql);
    console.log('SQL query result count:', res.length);
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

main().finally(() => prisma.$disconnect());
