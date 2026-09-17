import { prisma } from '../src/lib/db';
import { serializeBigInt } from '../src/lib/utils';

async function main() {
  try {
    const cols: any[] = await prisma.$queryRawUnsafe('DESCRIBE site_page_tabs');
    console.log('--- SITE_PAGE_TABS COLUMNS ---');
    console.log(JSON.stringify(serializeBigInt(cols), null, 2));

    const sample: any[] = await prisma.$queryRawUnsafe('SELECT * FROM site_page_tabs LIMIT 5');
    console.log('--- SITE_PAGE_TABS SAMPLE ---');
    console.log(JSON.stringify(serializeBigInt(sample), null, 2));
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
