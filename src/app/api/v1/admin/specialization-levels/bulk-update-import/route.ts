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

    let updatedCount = 0;
    const now = new Date();

    for (const row of rows) {
      const idRaw = row['id'] || row['ID'] || row['Id'] || '';
      if (!idRaw) continue;

      const id = Number(idRaw);
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM specialization_levels WHERE id = ? LIMIT 1`,
        id
      );

      if (existing.length === 0) continue;
      const current = existing[0];

      const specIdRaw = row['specialization_id'] || row['Specialization ID'] || row['specialization'] || '';
      const specialization_id = specIdRaw ? Number(specIdRaw) : current.specialization_id;
      const level = String(row['level'] || row['Level'] || current.level || '').trim();
      const level_slug = slugify(level);
      const duration = row['duration'] !== undefined ? String(row['duration']).trim() : current.duration;
      const tuition_fees = row['tuition_fees'] !== undefined ? String(row['tuition_fees']).trim() : current.tuition_fees;
      const intake = row['intake'] !== undefined ? String(row['intake']).trim() : current.intake;
      const accreditation = row['accreditation'] !== undefined ? String(row['accreditation']).trim() : current.accreditation;

      await prisma.$executeRawUnsafe(
        `UPDATE specialization_levels 
         SET specialization_id = ?, level = ?, level_slug = ?, duration = ?, tuition_fees = ?, intake = ?, accreditation = ?, updated_at = ?
         WHERE id = ?`,
        specialization_id,
        level,
        level_slug,
        duration || null,
        tuition_fees || null,
        intake || null,
        accreditation || null,
        now,
        id
      );

      updatedCount++;
    }

    if (updatedCount > 0) {
      return NextResponse.json({
        status: true,
        message: `${updatedCount} out of ${rows.length} rows updated successfully.`,
        updatedCount,
        totalCount: rows.length,
      });
    } else {
      return NextResponse.json({
        status: false,
        message: 'No records updated. Check if valid IDs exist in the file.',
      });
    }
  } catch (error: any) {
    console.error('Error bulk updating specialization levels:', error);
    return NextResponse.json({ status: false, message: 'Failed to bulk update specialization levels', error: error.message }, { status: 500 });
  }
}
