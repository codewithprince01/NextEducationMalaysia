import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { slugify } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ status: false, message: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'No data found in uploaded file.' }, { status: 400 });
    }

    let insertedCount = 0;
    const now = new Date();

    for (const row of rows) {
      const name = String(row['name'] || row['Name'] || row['University Name'] || '').trim();
      if (!name) continue;

      const city = String(row['city'] || row['City'] || '').trim();
      const state = String(row['state'] || row['State'] || '').trim();
      const rank = String(row['rank'] || row['Rank'] || '').trim();
      const shortnote = String(row['shortnote'] || row['Shortnote'] || row['overview'] || '').trim();

      // Check if university exists
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM universities WHERE name = ? AND website = 'MYS' LIMIT 1`,
        name
      );

      if (existing.length === 0) {
        const uname = slugify(name);
        await prisma.$executeRawUnsafe(
          `INSERT INTO universities 
           (name, uname, city, state, rank, shortnote, website, status, featured, scholarship_available, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'MYS', 1, 0, 0, ?, ?)`,
          name,
          uname,
          city || null,
          state || null,
          rank || null,
          shortnote || null,
          now,
          now
        );
        insertedCount++;
      }
    }

    if (insertedCount > 0) {
      return NextResponse.json({
        status: true,
        message: `${insertedCount} out of ${rows.length} rows imported successfully.`,
        insertedCount,
        totalCount: rows.length,
      });
    } else {
      return NextResponse.json({
        status: false,
        message: 'No new data imported. All rows already exist or duplicate rows found.',
      });
    }
  } catch (error: any) {
    console.error('Error importing universities:', error);
    return NextResponse.json({ status: false, message: 'Failed to import universities', error: error.message }, { status: 500 });
  }
}
