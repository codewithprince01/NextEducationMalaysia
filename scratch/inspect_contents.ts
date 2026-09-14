import { prisma } from '../src/lib/db';
import { serializeBigInt } from '../src/lib/utils';

async function main() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM specialization_contents LIMIT 10');
    console.log('--- SPECIALIZATION CONTENTS ---');
    console.log(JSON.stringify(serializeBigInt(rows), null, 2));

    const cols: any[] = await prisma.$queryRawUnsafe('DESCRIBE specialization_contents');
    console.log('--- COLUMNS ---');
    console.log(JSON.stringify(serializeBigInt(cols), null, 2));
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

