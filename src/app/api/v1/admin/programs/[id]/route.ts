import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const progId = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT up.*, u.name as university_name, cc.name as category_name, cs.name as specialization_name
       FROM university_programs up
       LEFT JOIN universities u ON up.university_id = u.id
       LEFT JOIN course_categories cc ON up.course_category_id = cc.id
       LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
       WHERE up.id = ? LIMIT 1`,
      progId
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: serializeBigInt(rows[0]) });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch program', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const progId = parseInt(rawId, 10);
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

      // International Fees (new + legacy)
      total_fee_international,
      total_tuition_fee_international,
      annual_tuition_fee_international,
      year1_tuition_fee_international,
      year2_tuition_fee_international,
      year3_tuition_fee_international,
      year4_tuition_fee_international,
      scholarship_amount_international,
      tution_fee_after_scholarship_international,

      total_fee,
      total_tuition_fee,
      annual_tuition_fee,
      year1_tuition_fee,
      year2_tuition_fee,
      year3_tuition_fee,
      year4_tuition_fee,
      scholarship_amount,
      tution_fee_after_scholarship,

      // Untouched other fees
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
      currency,
      additional_note,

      // Local Fees (new + legacy)
      total_fee_local,
      total_tuition_fee_local,
      annual_tuition_fee_local,
      anual_tuition_fee_local,
      year1_tuition_fee_local,
      year2_tuition_fee_local,
      year3_tuition_fee_local,
      year4_tuition_fee_local,
      scholarship_amount_local,
      tution_fee_after_scholarship_local,

      meta_title,
      meta_keyword,
      meta_description,
      page_content,
      seo_rating,
      best_rating,
      review_number,
      og_image_path,
      status,
    } = body;

    if (!course_name || !course_name.trim()) {
      return NextResponse.json({ status: false, message: 'Course name is required' }, { status: 400 });
    }

    const slug = slugify(course_name);
    const now = new Date();

    // Reconcile international fees
    const finalTotalFeeIntl = total_fee_international !== undefined && total_fee_international !== '' ? total_fee_international : total_fee;
    const finalTotalTuitionFeeIntl = total_tuition_fee_international !== undefined && total_tuition_fee_international !== '' ? total_tuition_fee_international : total_tuition_fee;
    const finalAnnualTuitionFeeIntl = annual_tuition_fee_international !== undefined && annual_tuition_fee_international !== '' ? annual_tuition_fee_international : annual_tuition_fee;
    const finalYear1TuitionFeeIntl = year1_tuition_fee_international !== undefined && year1_tuition_fee_international !== '' ? year1_tuition_fee_international : year1_tuition_fee;
    const finalYear2TuitionFeeIntl = year2_tuition_fee_international !== undefined && year2_tuition_fee_international !== '' ? year2_tuition_fee_international : year2_tuition_fee;
    const finalYear3TuitionFeeIntl = year3_tuition_fee_international !== undefined && year3_tuition_fee_international !== '' ? year3_tuition_fee_international : year3_tuition_fee;
    const finalYear4TuitionFeeIntl = year4_tuition_fee_international !== undefined && year4_tuition_fee_international !== '' ? year4_tuition_fee_international : year4_tuition_fee;
    const finalScholarshipAmountIntl = scholarship_amount_international !== undefined && scholarship_amount_international !== '' ? scholarship_amount_international : scholarship_amount;
    const finalFeeAfterScholarshipIntl = tution_fee_after_scholarship_international !== undefined && tution_fee_after_scholarship_international !== '' ? tution_fee_after_scholarship_international : tution_fee_after_scholarship;

    // Reconcile local annual fee
    const finalAnnualTuitionFeeLocal = annual_tuition_fee_local !== undefined && annual_tuition_fee_local !== '' ? annual_tuition_fee_local : anual_tuition_fee_local;

    const fields = [
      'university_id = ?', 'course_category_id = ?', 'specialization_id = ?', 'course_name = ?', 'slug = ?',
      'level = ?', 'duration = ?', 'study_mode = ?', 'intake = ?', 'application_deadline = ?',
      'campus = ?', 'accreditations = ?', 'is_local = ?', 'is_international = ?',
      'overview = ?', 'entry_requirement = ?', 'exam_required = ?', 'mode_of_instruction = ?', 'scholarship_info = ?', 'courses_description = ?',
      'tution_fee = ?',

      // International legacy
      'total_fee = ?', 'total_tuition_fee = ?', 'annual_tuition_fee = ?',
      'year1_tuition_fee = ?', 'year2_tuition_fee = ?', 'year3_tuition_fee = ?', 'year4_tuition_fee = ?',
      'scholarship_amount = ?', 'tution_fee_after_scholarship = ?',

      // International new explicit
      'total_fee_international = ?', 'total_tuition_fee_international = ?', 'annual_tuition_fee_international = ?',
      'year1_tuition_fee_international = ?', 'year2_tuition_fee_international = ?', 'year3_tuition_fee_international = ?', 'year4_tuition_fee_international = ?',
      'scholarship_amount_international = ?', 'tution_fee_after_scholarship_international = ?',

      // Untouched other fees
      'registration_fee = ?', 'laboratory_fee = ?', 'library_fee = ?', 'technology_fee = ?',
      'student_activity_fee = ?', 'insurance_fee = ?', 'examination_fee = ?', 'application_fee = ?',
      'emgs_processing_fee = ?', 'international_student_fee = ?', 'international_security_deposit = ?',
      'international_student_charge = ?', 'international_administration_fee = ?', 'personal_bond_fee = ?',
      'resources_fee = ?', 'commitment_fee = ?', 'facilities_fee = ?', 'accommodation_fee = ?',
      'airport_pickup_fee = ?', 'other_fee = ?', 'currency = ?', 'additional_note = ?',

      // Local
      'total_fee_local = ?', 'total_tuition_fee_local = ?', 'annual_tuition_fee_local = ?', 'anual_tuition_fee_local = ?',
      'year1_tuition_fee_local = ?', 'year2_tuition_fee_local = ?', 'year3_tuition_fee_local = ?', 'year4_tuition_fee_local = ?',
      'scholarship_amount_local = ?', 'tution_fee_after_scholarship_local = ?',

      'meta_title = ?', 'meta_keyword = ?', 'meta_description = ?', 'page_content = ?',
      'seo_rating = ?', 'best_rating = ?', 'review_number = ?', 'og_image_path = ?',
      'status = ?', 'updated_at = ?'
    ];

    const sql = `UPDATE university_programs SET ${fields.join(', ')} WHERE id = ?`;

    const queryParams = [
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

      // International legacy
      finalTotalFeeIntl ? String(finalTotalFeeIntl) : null,
      finalTotalTuitionFeeIntl ? String(finalTotalTuitionFeeIntl) : null,
      finalAnnualTuitionFeeIntl ? String(finalAnnualTuitionFeeIntl) : null,
      finalYear1TuitionFeeIntl ? String(finalYear1TuitionFeeIntl) : null,
      finalYear2TuitionFeeIntl ? String(finalYear2TuitionFeeIntl) : null,
      finalYear3TuitionFeeIntl ? String(finalYear3TuitionFeeIntl) : null,
      finalYear4TuitionFeeIntl ? String(finalYear4TuitionFeeIntl) : null,
      finalScholarshipAmountIntl ? String(finalScholarshipAmountIntl) : null,
      finalFeeAfterScholarshipIntl ? String(finalFeeAfterScholarshipIntl) : null,

      // International new explicit
      finalTotalFeeIntl ? String(finalTotalFeeIntl) : null,
      finalTotalTuitionFeeIntl ? String(finalTotalTuitionFeeIntl) : null,
      finalAnnualTuitionFeeIntl ? String(finalAnnualTuitionFeeIntl) : null,
      finalYear1TuitionFeeIntl ? String(finalYear1TuitionFeeIntl) : null,
      finalYear2TuitionFeeIntl ? String(finalYear2TuitionFeeIntl) : null,
      finalYear3TuitionFeeIntl ? String(finalYear3TuitionFeeIntl) : null,
      finalYear4TuitionFeeIntl ? String(finalYear4TuitionFeeIntl) : null,
      finalScholarshipAmountIntl ? String(finalScholarshipAmountIntl) : null,
      finalFeeAfterScholarshipIntl ? String(finalFeeAfterScholarshipIntl) : null,

      // Untouched other fees
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
      currency || 'MYR',
      additional_note || null,

      // Local
      total_fee_local ? String(total_fee_local) : null,
      total_tuition_fee_local ? String(total_tuition_fee_local) : null,
      finalAnnualTuitionFeeLocal ? String(finalAnnualTuitionFeeLocal) : null,
      finalAnnualTuitionFeeLocal ? String(finalAnnualTuitionFeeLocal) : null,
      year1_tuition_fee_local ? String(year1_tuition_fee_local) : null,
      year2_tuition_fee_local ? String(year2_tuition_fee_local) : null,
      year3_tuition_fee_local ? String(year3_tuition_fee_local) : null,
      year4_tuition_fee_local ? String(year4_tuition_fee_local) : null,
      scholarship_amount_local ? String(scholarship_amount_local) : null,
      tution_fee_after_scholarship_local ? String(tution_fee_after_scholarship_local) : null,

      meta_title || null,
      meta_keyword || null,
      meta_description || null,
      page_content || null,
      seo_rating !== undefined && seo_rating !== '' && seo_rating !== null ? parseFloat(String(seo_rating)) : null,
      best_rating !== undefined && best_rating !== '' && best_rating !== null ? parseFloat(String(best_rating)) : null,
      review_number !== undefined && review_number !== '' && review_number !== null ? parseInt(String(review_number), 10) : null,
      og_image_path || null,
      status !== undefined ? Number(status) : 1,
      now,
      progId
    ];

    await prisma.$executeRawUnsafe(sql, ...queryParams);

    return NextResponse.json({ status: true, message: 'Program updated successfully' });
  } catch (error: any) {
    console.error('Error updating program:', error);
    return NextResponse.json({ status: false, message: 'Failed to update program', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const progId = parseInt(rawId, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM university_programs WHERE id = ?`, progId);
    return NextResponse.json({ status: true, message: 'Program deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete program', error: error.message }, { status: 500 });
  }
}
