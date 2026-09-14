import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');
    const search = searchParams.get('search');

    let sql = `SELECT up.*, u.name as university_name, cc.name as category_name, cs.name as specialization_name
               FROM university_programs up
               LEFT JOIN universities u ON up.university_id = u.id
               LEFT JOIN course_categories cc ON up.course_category_id = cc.id
               LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
               WHERE 1=1`;
    const params: any[] = [];

    if (universityId) {
      sql += ` AND up.university_id = ?`;
      params.push(Number(universityId));
    }

    if (search && search.trim() !== '') {
      sql += ` AND up.course_name LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` ORDER BY up.id DESC LIMIT 1000`;

    const programs: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      message: 'Programs retrieved successfully',
      data: serializeBigInt(programs),
    });
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch programs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      university_id,
      course_category_id,
      specialization_id,
      course_name,
      level,
      duration,
      study_mode,
      intake,
      application_deadline,
      campus,
      accreditations,
      is_local,
      is_international,
      overview,
      entry_requirement,
      exam_required,
      mode_of_instruction,
      scholarship_info,
      courses_description,
      tution_fee,
      total_fee,
      total_tuition_fee,
      annual_tuition_fee,
      year1_tuition_fee,
      year2_tuition_fee,
      year3_tuition_fee,
      year4_tuition_fee,
      registration_fee,
      laboratory_fee,
      library_fee,
      technology_fee,
      student_activity_fee,
      insurance_fee,
      examination_fee,
      application_fee,
      emgs_processing_fee,
      international_student_fee,
      international_security_deposit,
      international_student_charge,
      international_administration_fee,
      personal_bond_fee,
      resources_fee,
      commitment_fee,
      facilities_fee,
      accommodation_fee,
      airport_pickup_fee,
      other_fee,
      scholarship_amount,
      tution_fee_after_scholarship,
      currency,
      additional_note,
      anual_tuition_fee_local,
      year1_tuition_fee_local,
      year2_tuition_fee_local,
      year3_tuition_fee_local,
      year4_tuition_fee_local,
      total_tuition_fee_local,
      meta_title,
      meta_keyword,
      meta_description,
      page_content,
      status,
    } = body;

    if (!course_name || !course_name.trim()) {
      return NextResponse.json({ status: false, message: 'Course name is required' }, { status: 400 });
    }

    const slug = slugify(course_name);
    const now = new Date();

    const fields = [
      'university_id', 'course_category_id', 'specialization_id', 'course_name', 'slug',
      'level', 'duration', 'study_mode', 'intake', 'application_deadline',
      'campus', 'accreditations', 'is_local', 'is_international',
      'overview', 'entry_requirement', 'exam_required', 'mode_of_instruction', 'scholarship_info', 'courses_description',
      'tution_fee', 'total_fee', 'total_tuition_fee', 'annual_tuition_fee',
      'year1_tuition_fee', 'year2_tuition_fee', 'year3_tuition_fee', 'year4_tuition_fee',
      'registration_fee', 'laboratory_fee', 'library_fee', 'technology_fee',
      'student_activity_fee', 'insurance_fee', 'examination_fee', 'application_fee',
      'emgs_processing_fee', 'international_student_fee', 'international_security_deposit',
      'international_student_charge', 'international_administration_fee', 'personal_bond_fee',
      'resources_fee', 'commitment_fee', 'facilities_fee', 'accommodation_fee',
      'airport_pickup_fee', 'other_fee', 'scholarship_amount', 'tution_fee_after_scholarship',
      'currency', 'additional_note',
      'anual_tuition_fee_local', 'year1_tuition_fee_local', 'year2_tuition_fee_local',
      'year3_tuition_fee_local', 'year4_tuition_fee_local', 'total_tuition_fee_local',
      'meta_title', 'meta_keyword', 'meta_description', 'page_content',
      'status', 'website', 'created_at', 'updated_at'
    ];

    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO university_programs (${fields.join(', ')}) VALUES (${placeholders})`;

    const params = [
      university_id ? Number(university_id) : null,
      course_category_id ? Number(course_category_id) : null,
      specialization_id ? Number(specialization_id) : null,
      course_name.trim(),
      slug,
      level || null,
      duration || null,
      study_mode || null,
      intake || null,
      application_deadline || null,
      campus || null,
      accreditations || null,
      is_local ? 1 : 0,
      is_international ? 1 : 0,
      overview || null,
      entry_requirement || null,
      exam_required || null,
      mode_of_instruction || null,
      scholarship_info || null,
      courses_description || null,
      tution_fee ? String(tution_fee) : null,
      total_fee ? String(total_fee) : null,
      total_tuition_fee ? String(total_tuition_fee) : null,
      annual_tuition_fee ? String(annual_tuition_fee) : null,
      year1_tuition_fee ? String(year1_tuition_fee) : null,
      year2_tuition_fee ? String(year2_tuition_fee) : null,
      year3_tuition_fee ? String(year3_tuition_fee) : null,
      year4_tuition_fee ? String(year4_tuition_fee) : null,
      registration_fee ? String(registration_fee) : null,
      laboratory_fee ? String(laboratory_fee) : null,
      library_fee ? String(library_fee) : null,
      technology_fee ? String(technology_fee) : null,
      student_activity_fee ? String(student_activity_fee) : null,
      insurance_fee ? String(insurance_fee) : null,
      examination_fee ? String(examination_fee) : null,
      application_fee ? String(application_fee) : null,
      emgs_processing_fee ? String(emgs_processing_fee) : null,
      international_student_fee ? String(international_student_fee) : null,
      international_security_deposit ? String(international_security_deposit) : null,
      international_student_charge ? String(international_student_charge) : null,
      international_administration_fee ? String(international_administration_fee) : null,
      personal_bond_fee ? String(personal_bond_fee) : null,
      resources_fee ? String(resources_fee) : null,
      commitment_fee ? String(commitment_fee) : null,
      facilities_fee ? String(facilities_fee) : null,
      accommodation_fee ? String(accommodation_fee) : null,
      airport_pickup_fee ? String(airport_pickup_fee) : null,
      other_fee ? String(other_fee) : null,
      scholarship_amount ? String(scholarship_amount) : null,
      tution_fee_after_scholarship ? String(tution_fee_after_scholarship) : null,
      currency || 'MYR',
      additional_note || null,
      anual_tuition_fee_local ? String(anual_tuition_fee_local) : null,
      year1_tuition_fee_local ? String(year1_tuition_fee_local) : null,
      year2_tuition_fee_local ? String(year2_tuition_fee_local) : null,
      year3_tuition_fee_local ? String(year3_tuition_fee_local) : null,
      year4_tuition_fee_local ? String(year4_tuition_fee_local) : null,
      total_tuition_fee_local ? String(total_tuition_fee_local) : null,
      meta_title || null,
      meta_keyword || null,
      meta_description || null,
      page_content || null,
      status !== undefined ? Number(status) : 1,
      'MYS',
      now,
      now
    ];

    await prisma.$executeRawUnsafe(sql, ...params);

    return NextResponse.json({ status: true, message: 'Program created successfully' });
  } catch (error: any) {
    console.error('Error creating program:', error);
    return NextResponse.json({ status: false, message: 'Failed to create program', error: error.message }, { status: 500 });
  }
}
