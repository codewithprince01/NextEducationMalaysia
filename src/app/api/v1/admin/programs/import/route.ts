import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { slugify } from '@/lib/utils';

// Map of normalized incoming header keys to university_programs column names
const COLUMN_MAP: Record<string, string> = {
  university_id: 'university_id',
  course_name: 'course_name',
  coursename: 'course_name',
  program_name: 'course_name',
  name: 'course_name',
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

    let insertedCount = 0;
    const now = new Date();

    for (const rawRow of rows) {
      const row: Record<string, any> = {};
      for (const [k, v] of Object.entries(rawRow)) {
        const normKey = normalizeKey(k);
        const col = COLUMN_MAP[normKey];
        if (col) {
          row[col] = v;
        }
      }

      const courseName = row['course_name'] ? String(row['course_name']).trim() : '';
      if (!courseName) continue;

      const targetUnivId = row['university_id'] ? Number(row['university_id']) : universityId;
      const slug = slugify(courseName);

      // Check if duplicate course for same university exists
      if (targetUnivId) {
        const existing: any[] = await prisma.$queryRawUnsafe(
          `SELECT id FROM university_programs WHERE university_id = ? AND LOWER(TRIM(course_name)) = LOWER(TRIM(?)) LIMIT 1`,
          targetUnivId,
          courseName
        );
        if (existing.length > 0) {
          continue;
        }
      }

      // Reconcile international fees
      const totalFeeIntl = cleanNumeric(row['total_fee_international'] !== undefined ? row['total_fee_international'] : row['total_fee']);
      const totalTuitionFeeIntl = cleanNumeric(row['total_tuition_fee_international'] !== undefined ? row['total_tuition_fee_international'] : row['total_tuition_fee']);
      const annualTuitionFeeIntl = cleanNumeric(row['annual_tuition_fee_international'] !== undefined ? row['annual_tuition_fee_international'] : row['annual_tuition_fee']);
      const year1TuitionFeeIntl = cleanNumeric(row['year1_tuition_fee_international'] !== undefined ? row['year1_tuition_fee_international'] : row['year1_tuition_fee']);
      const year2TuitionFeeIntl = cleanNumeric(row['year2_tuition_fee_international'] !== undefined ? row['year2_tuition_fee_international'] : row['year2_tuition_fee']);
      const year3TuitionFeeIntl = cleanNumeric(row['year3_tuition_fee_international'] !== undefined ? row['year3_tuition_fee_international'] : row['year3_tuition_fee']);
      const year4TuitionFeeIntl = cleanNumeric(row['year4_tuition_fee_international'] !== undefined ? row['year4_tuition_fee_international'] : row['year4_tuition_fee']);
      const scholarshipAmountIntl = cleanNumeric(row['scholarship_amount_international'] !== undefined ? row['scholarship_amount_international'] : row['scholarship_amount']);
      const feeAfterScholarshipIntl = cleanNumeric(row['tution_fee_after_scholarship_international'] !== undefined ? row['tution_fee_after_scholarship_international'] : row['tution_fee_after_scholarship']);

      // Reconcile local annual fee
      const annualTuitionFeeLocal = cleanNumeric(row['annual_tuition_fee_local'] !== undefined ? row['annual_tuition_fee_local'] : row['anual_tuition_fee_local']);

      const fields = [
        'university_id', 'course_category_id', 'specialization_id', 'course_name', 'slug',
        'level', 'duration', 'study_mode', 'intake', 'application_deadline',
        'campus', 'accreditations', 'is_local', 'is_international',
        'overview', 'entry_requirement', 'exam_required', 'mode_of_instruction', 'scholarship_info', 'courses_description',
        'tution_fee',

        // International legacy + explicit
        'total_fee', 'total_tuition_fee', 'annual_tuition_fee',
        'year1_tuition_fee', 'year2_tuition_fee', 'year3_tuition_fee', 'year4_tuition_fee',
        'scholarship_amount', 'tution_fee_after_scholarship',
        'total_fee_international', 'total_tuition_fee_international', 'annual_tuition_fee_international',
        'year1_tuition_fee_international', 'year2_tuition_fee_international', 'year3_tuition_fee_international', 'year4_tuition_fee_international',
        'scholarship_amount_international', 'tution_fee_after_scholarship_international',

        // Untouched other fees
        'registration_fee', 'laboratory_fee', 'library_fee', 'technology_fee',
        'student_activity_fee', 'insurance_fee', 'examination_fee', 'application_fee',
        'emgs_processing_fee', 'international_student_fee', 'international_security_deposit',
        'international_student_charge', 'international_administration_fee', 'personal_bond_fee',
        'resources_fee', 'commitment_fee', 'facilities_fee', 'accommodation_fee',
        'airport_pickup_fee', 'other_fee', 'currency', 'additional_note',

        // Local
        'total_fee_local', 'total_tuition_fee_local', 'annual_tuition_fee_local', 'anual_tuition_fee_local',
        'year1_tuition_fee_local', 'year2_tuition_fee_local', 'year3_tuition_fee_local', 'year4_tuition_fee_local',
        'scholarship_amount_local', 'tution_fee_after_scholarship_local',

        'meta_title', 'meta_keyword', 'meta_description', 'page_content',
        'status', 'website', 'created_at', 'updated_at'
      ];

      const placeholders = fields.map(() => '?').join(', ');
      const sql = `INSERT INTO university_programs (${fields.join(', ')}) VALUES (${placeholders})`;

      const isLocal = row['is_local'] === '1' || row['is_local'] === 1 || row['is_local'] === true ? 1 : 0;
      const isInternational = row['is_international'] === '0' || row['is_international'] === 0 || row['is_international'] === false ? 0 : 1;

      const params = [
        targetUnivId || null,
        cleanNumeric(row['course_category_id']),
        cleanNumeric(row['specialization_id']),
        courseName,
        slug,
        row['level'] ? String(row['level']).trim() : null,
        row['duration'] ? String(row['duration']).trim() : null,
        row['study_mode'] ? String(row['study_mode']).trim() : null,
        row['intake'] ? String(row['intake']).trim() : null,
        row['application_deadline'] ? String(row['application_deadline']).trim() : null,
        row['campus'] ? String(row['campus']).trim() : null,
        row['accreditations'] ? String(row['accreditations']).trim() : null,
        isLocal,
        isInternational,
        row['overview'] ? String(row['overview']).trim() : null,
        row['entry_requirement'] ? String(row['entry_requirement']).trim() : null,
        row['exam_required'] ? String(row['exam_required']).trim() : null,
        row['mode_of_instruction'] ? String(row['mode_of_instruction']).trim() : null,
        row['scholarship_info'] ? String(row['scholarship_info']).trim() : null,
        row['courses_description'] ? String(row['courses_description']).trim() : null,
        cleanNumeric(row['tution_fee']),

        // International legacy
        totalFeeIntl,
        totalTuitionFeeIntl,
        annualTuitionFeeIntl,
        year1TuitionFeeIntl,
        year2TuitionFeeIntl,
        year3TuitionFeeIntl,
        year4TuitionFeeIntl,
        scholarshipAmountIntl,
        feeAfterScholarshipIntl,

        // International explicit
        totalFeeIntl,
        totalTuitionFeeIntl,
        annualTuitionFeeIntl,
        year1TuitionFeeIntl,
        year2TuitionFeeIntl,
        year3TuitionFeeIntl,
        year4TuitionFeeIntl,
        scholarshipAmountIntl,
        feeAfterScholarshipIntl,

        // Untouched other fees
        cleanNumeric(row['registration_fee']),
        cleanNumeric(row['laboratory_fee']),
        cleanNumeric(row['library_fee']),
        cleanNumeric(row['technology_fee']),
        cleanNumeric(row['student_activity_fee']),
        cleanNumeric(row['insurance_fee']),
        cleanNumeric(row['examination_fee']),
        cleanNumeric(row['application_fee']),
        cleanNumeric(row['emgs_processing_fee']),
        cleanNumeric(row['international_student_fee']),
        cleanNumeric(row['international_security_deposit']),
        cleanNumeric(row['international_student_charge']),
        cleanNumeric(row['international_administration_fee']),
        cleanNumeric(row['personal_bond_fee']),
        cleanNumeric(row['resources_fee']),
        cleanNumeric(row['commitment_fee']),
        cleanNumeric(row['facilities_fee']),
        cleanNumeric(row['accommodation_fee']),
        cleanNumeric(row['airport_pickup_fee']),
        cleanNumeric(row['other_fee']),
        row['currency'] ? String(row['currency']).trim() : 'MYR',
        row['additional_note'] ? String(row['additional_note']).trim() : null,

        // Local
        cleanNumeric(row['total_fee_local']),
        cleanNumeric(row['total_tuition_fee_local']),
        annualTuitionFeeLocal,
        annualTuitionFeeLocal,
        cleanNumeric(row['year1_tuition_fee_local']),
        cleanNumeric(row['year2_tuition_fee_local']),
        cleanNumeric(row['year3_tuition_fee_local']),
        cleanNumeric(row['year4_tuition_fee_local']),
        cleanNumeric(row['scholarship_amount_local']),
        cleanNumeric(row['tution_fee_after_scholarship_local']),

        row['meta_title'] ? String(row['meta_title']).trim() : null,
        row['meta_keyword'] ? String(row['meta_keyword']).trim() : null,
        row['meta_description'] ? String(row['meta_description']).trim() : null,
        row['page_content'] ? String(row['page_content']).trim() : null,
        row['status'] !== undefined && row['status'] !== '' ? Number(row['status']) : 1,
        'MYS',
        now,
        now
      ];

      await prisma.$executeRawUnsafe(sql, ...params);
      insertedCount++;
    }

    if (insertedCount > 0) {
      return NextResponse.json({
        status: true,
        message: `${insertedCount} out of ${rows.length} programs imported successfully.`,
        insertedCount,
        totalCount: rows.length,
      });
    } else {
      return NextResponse.json({
        status: false,
        message: 'No programs were imported. Records may already exist or course names were missing.',
      });
    }
  } catch (error: any) {
    console.error('Error in import programs:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to import programs: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
