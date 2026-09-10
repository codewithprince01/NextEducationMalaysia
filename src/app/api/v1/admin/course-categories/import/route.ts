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
      const name = String(row['name'] || row['Name'] || '').trim();
      if (!name) continue;

      const shortnote = String(row['shortnote'] || row['Shortnote'] || '').trim();
      const icon_class = String(row['icon_class'] || row['Icon Class'] || row['icon'] || '').trim();
      const courses_description = String(row['courses_description'] || row['Courses Description'] || row['description'] || '').trim();

      // Check if category exists
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM course_categories WHERE name = ? AND website = 'MYS' LIMIT 1`,
        name
      );

      if (existing.length === 0) {
        const slug = slugify(name);
        await prisma.$executeRawUnsafe(
          `INSERT INTO course_categories 
           (name, slug, shortnote, icon_class, courses_description, website, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'MYS', 1, ?, ?)`,
          name,
          slug,
          shortnote || null,
          icon_class || null,
          courses_description || null,
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
    console.error('Error importing categories:', error);
    return NextResponse.json({ status: false, message: 'Failed to import categories', error: error.message }, { status: 500 });
  }
}
