import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { recordAuditLog } from '@/lib/auditLogger';

// Map of normalized incoming header keys to university_programs column names
const COLUMN_MAP: Record<string, string> = {
  id: 'id',
  course_name: 'course_name',
  coursename: 'course_name',
  program_name: 'course_name',
  course_category_id: 'course_category_id',
  category_id: 'course_category_id',
  specialization_id: 'specialization_id',
  level: 'level',
  duration: 'duration',
  study_mode: 'study_mode',
  intake: 'intake',
  application_deadline: 'application_deadline',
  deadline: 'application_deadline',
  campus: 'campus',
  accreditations: 'accreditations',
  accreditation: 'accreditations',
  is_local: 'is_local',
  is_international: 'is_international',
  overview: 'overview',
  entry_requirement: 'entry_requirement',
  exam_required: 'exam_required',
  mode_of_instruction: 'mode_of_instruction',
  scholarship_info: 'scholarship_info',
  courses_description: 'courses_description',

  // Local Fees
  total_fee_local: 'total_fee_local',
  total_tuition_fee_local: 'total_tuition_fee_local',
  annual_tuition_fee_local: 'annual_tuition_fee_local',
  anual_tuition_fee_local: 'annual_tuition_fee_local',
  year1_tuition_fee_local: 'year1_tuition_fee_local',
  year2_tuition_fee_local: 'year2_tuition_fee_local',
  year3_tuition_fee_local: 'year3_tuition_fee_local',
  year4_tuition_fee_local: 'year4_tuition_fee_local',
  scholarship_amount_local: 'scholarship_amount_local',
  tution_fee_after_scholarship_local: 'tution_fee_after_scholarship_local',

  // International Fees
  total_fee_international: 'total_fee_international',
  total_tuition_fee_international: 'total_tuition_fee_international',
  annual_tuition_fee_international: 'annual_tuition_fee_international',
  year1_tuition_fee_international: 'year1_tuition_fee_international',
  year2_tuition_fee_international: 'year2_tuition_fee_international',
  year3_tuition_fee_international: 'year3_tuition_fee_international',
  year4_tuition_fee_international: 'year4_tuition_fee_international',
  scholarship_amount_international: 'scholarship_amount_international',
  tution_fee_after_scholarship_international: 'tution_fee_after_scholarship_international',

  // Legacy mappings for international
  tution_fee: 'tution_fee',
  tuition_fee: 'tution_fee',
  total_fee: 'total_fee',
  total_tuition_fee: 'total_tuition_fee',
  annual_tuition_fee: 'annual_tuition_fee',
  year1_tuition_fee: 'year1_tuition_fee',
  year2_tuition_fee: 'year2_tuition_fee',
  year3_tuition_fee: 'year3_tuition_fee',
  year4_tuition_fee: 'year4_tuition_fee',
  scholarship_amount: 'scholarship_amount',
  tution_fee_after_scholarship: 'tution_fee_after_scholarship',

  // Untouched additional fees
  registration_fee: 'registration_fee',
  laboratory_fee: 'laboratory_fee',
  library_fee: 'library_fee',
  technology_fee: 'technology_fee',
  student_activity_fee: 'student_activity_fee',
  insurance_fee: 'insurance_fee',
  examination_fee: 'examination_fee',
  application_fee: 'application_fee',
  emgs_processing_fee: 'emgs_processing_fee',
  international_student_fee: 'international_student_fee',
  international_security_deposit: 'international_security_deposit',
  international_student_charge: 'international_student_charge',
  international_administration_fee: 'international_administration_fee',
  personal_bond_fee: 'personal_bond_fee',
  resources_fee: 'resources_fee',
  commitment_fee: 'commitment_fee',
  facilities_fee: 'facilities_fee',
  accommodation_fee: 'accommodation_fee',
  airport_pickup_fee: 'airport_pickup_fee',
  other_fee: 'other_fee',
  currency: 'currency',
  additional_note: 'additional_note',

  meta_title: 'meta_title',
  meta_keyword: 'meta_keyword',
  meta_description: 'meta_description',
  page_content: 'page_content',
  status: 'status',
};

const NUMERIC_COLS = new Set([
  'university_id', 'course_category_id', 'specialization_id',
  'tution_fee', 'total_fee', 'total_tuition_fee', 'annual_tuition_fee',
  'year1_tuition_fee', 'year2_tuition_fee', 'year3_tuition_fee', 'year4_tuition_fee',
  'scholarship_amount', 'tution_fee_after_scholarship',

  // Local
  'total_fee_local', 'total_tuition_fee_local', 'annual_tuition_fee_local', 'anual_tuition_fee_local',
  'year1_tuition_fee_local', 'year2_tuition_fee_local', 'year3_tuition_fee_local', 'year4_tuition_fee_local',
  'scholarship_amount_local', 'tution_fee_after_scholarship_local',

  // International
  'total_fee_international', 'total_tuition_fee_international', 'annual_tuition_fee_international',
  'year1_tuition_fee_international', 'year2_tuition_fee_international', 'year3_tuition_fee_international',
  'year4_tuition_fee_international', 'scholarship_amount_international', 'tution_fee_after_scholarship_international',

  // Untouched additional fees
  'registration_fee', 'laboratory_fee', 'library_fee', 'technology_fee',
  'student_activity_fee', 'insurance_fee', 'examination_fee', 'application_fee',
  'emgs_processing_fee', 'international_student_fee', 'international_security_deposit',
  'international_student_charge', 'international_administration_fee', 'personal_bond_fee',
  'resources_fee', 'commitment_fee', 'facilities_fee', 'accommodation_fee',
  'airport_pickup_fee', 'other_fee'
]);

const BOOLEAN_COLS = new Set([
  'is_local', 'is_international', 'status'
]);

// Mirrored column pairs to ensure both legacy and explicit columns stay in sync
const MIRRORED_PAIRS: Record<string, string[]> = {
  total_fee_international: ['total_fee'],
  total_fee: ['total_fee_international'],
  total_tuition_fee_international: ['total_tuition_fee'],
  total_tuition_fee: ['total_tuition_fee_international'],
  annual_tuition_fee_international: ['annual_tuition_fee'],
  annual_tuition_fee: ['annual_tuition_fee_international'],
  year1_tuition_fee_international: ['year1_tuition_fee'],
  year1_tuition_fee: ['year1_tuition_fee_international'],
  year2_tuition_fee_international: ['year2_tuition_fee'],
  year2_tuition_fee: ['year2_tuition_fee_international'],
  year3_tuition_fee_international: ['year3_tuition_fee'],
  year3_tuition_fee: ['year3_tuition_fee_international'],
  year4_tuition_fee_international: ['year4_tuition_fee'],
  year4_tuition_fee: ['year4_tuition_fee_international'],
  scholarship_amount_international: ['scholarship_amount'],
  scholarship_amount: ['scholarship_amount_international'],
  tution_fee_after_scholarship_international: ['tution_fee_after_scholarship'],
  tution_fee_after_scholarship: ['tution_fee_after_scholarship_international'],
  annual_tuition_fee_local: ['anual_tuition_fee_local'],
  anual_tuition_fee_local: ['annual_tuition_fee_local'],
};

function normalizeKey(key: string): string {
  return String(key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function cleanNumeric(val: any): number | null {
  if (val === undefined || val === null) return null;
  const str = String(val).replace(/[^0-9.-]/g, '').trim();
  if (str === '' || isNaN(Number(str))) return null;
  return Number(str);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const universityIdRaw = formData.get('university_id') as string | null;
    const universityId = universityIdRaw ? Number(universityIdRaw) : null;

    if (!file) {
      return NextResponse.json({ status: false, message: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'No data found in uploaded file.' }, { status: 400 });
    }

    let updatedCount = 0;
    const now = new Date();

    for (const rawRow of rows) {
      // Map row keys to normalized DB columns
      const row: Record<string, any> = {};
      for (const [k, v] of Object.entries(rawRow)) {
        const normKey = normalizeKey(k);
        const col = COLUMN_MAP[normKey];
        if (col) {
          row[col] = v;
        }
      }

      // Try matching by ID first
      let targetId: number | null = null;
      if (row['id'] !== undefined && String(row['id']).trim() !== '') {
        const parsed = Number(row['id']);
        if (!isNaN(parsed) && parsed > 0) {
          targetId = parsed;
        }
      }

      // If ID not found, attempt match by university_id + course_name
      if (!targetId && row['course_name']) {
        const uId = row['university_id'] ? Number(row['university_id']) : universityId;
        if (uId) {
          const match: any[] = await prisma.$queryRawUnsafe(
            `SELECT id FROM university_programs WHERE university_id = ? AND LOWER(TRIM(course_name)) = LOWER(TRIM(?)) LIMIT 1`,
            uId,
            String(row['course_name']).trim()
          );
          if (match.length > 0) {
            targetId = Number(match[0].id);
          }
        }
      }

      if (!targetId) continue;

      // Verify the target record exists
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM university_programs WHERE id = ? LIMIT 1`,
        targetId
      );
      if (existing.length === 0) continue;

      // Build dynamic UPDATE statement with columns present in row
      const updateFieldsMap = new Map<string, any>();

      for (const [col, val] of Object.entries(row)) {
        if (col === 'id') continue;

        let formattedVal: any;

        if (NUMERIC_COLS.has(col)) {
          formattedVal = cleanNumeric(val);
        } else if (BOOLEAN_COLS.has(col)) {
          const s = String(val).trim().toLowerCase();
          if (s === '1' || s === 'true') {
            formattedVal = 1;
          } else if (s === '0' || s === 'false') {
            formattedVal = 0;
          } else if (s === '') {
            formattedVal = null;
          } else {
            formattedVal = Number(s) ? 1 : 0;
          }
        } else {
          formattedVal = val !== undefined && val !== null ? String(val).trim() : null;
          if (formattedVal === '') formattedVal = null;
        }

        updateFieldsMap.set(col, formattedVal);

        // Also update mirrored columns
        const mirrors = MIRRORED_PAIRS[col];
        if (mirrors) {
          for (const m of mirrors) {
            if (!updateFieldsMap.has(m)) {
              updateFieldsMap.set(m, formattedVal);
            }
          }
        }
      }

      if (updateFieldsMap.size === 0) continue;

      const updateFields: string[] = [];
      const updateParams: any[] = [];

      for (const [col, val] of updateFieldsMap.entries()) {
        updateFields.push(`${col} = ?`);
        updateParams.push(val);
      }

      updateFields.push('updated_at = ?');
      updateParams.push(now);

      updateParams.push(targetId);

      const sql = `UPDATE university_programs SET ${updateFields.join(', ')} WHERE id = ?`;
      await prisma.$executeRawUnsafe(sql, ...updateParams);
      updatedCount++;
    }

    if (updatedCount > 0) {
      await recordAuditLog({
        req,
        action: 'UPDATE',
        module: 'programs',
        description: `Bulk updated ${updatedCount} programs from file '${file.name || 'excel'}'`,
        newValues: {
          updatedCount,
          totalRows: rows.length,
          fileName: file.name,
          universityId,
        },
      });

      return NextResponse.json({
        status: true,
        message: `${updatedCount} out of ${rows.length} program records updated successfully.`,
        updatedCount,
        totalCount: rows.length,
      });
    } else {
      return NextResponse.json({
        status: false,
        message: 'No records were updated. Please make sure the uploaded file contains valid program "id" values or matching course names.',
      });
    }
  } catch (error: any) {
    console.error('Error in bulk update programs:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update bulk program data: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
