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
      const specIdRaw = row['specialization_id'] || row['Specialization ID'] || row['specialization'] || '';
      const specialization_id = specIdRaw ? Number(specIdRaw) : null;
      const level = String(row['level'] || row['Level'] || '').trim();

      if (!specialization_id || !level) continue;

      const duration = String(row['duration'] || row['Duration'] || '').trim();
      const tuition_fees = String(row['tuition_fees'] || row['Tuition Fees'] || '').trim();
      const intake = String(row['intake'] || row['Intake'] || '').trim();
      const accreditation = String(row['accreditation'] || row['Accreditation'] || '').trim();

      // Check if specialization level exists for this specialization & level
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM specialization_levels WHERE specialization_id = ? AND level = ? LIMIT 1`,
        specialization_id,
        level
      );

      if (existing.length === 0) {
        const level_slug = slugify(level);
        await prisma.$executeRawUnsafe(
          `INSERT INTO specialization_levels 
           (id, specialization_id, level, level_slug, duration, tuition_fees, intake, accreditation, created_at, updated_at)
           SELECT IFNULL(MAX(id), 0) + 1, ?, ?, ?, ?, ?, ?, ?, ?, ? FROM specialization_levels sl_max`,
          specialization_id,
          level,
          level_slug,
          duration || null,
          tuition_fees || null,
          intake || null,
          accreditation || null,
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
        message: 'Data not imported. Duplicate rows found or no valid rows.',
      });
    }
  } catch (error: any) {
    console.error('Error importing specialization levels:', error);
    return NextResponse.json({ status: false, message: 'Failed to import specialization levels', error: error.message }, { status: 500 });
  }
}
