import { prisma } from '@/lib/db';
import { 
  PersonalInfoInput, 
  EduSummaryInput, 
  SchoolInput, 
  TestScoreInput,
  GreInput,
  GmatInput,
  SatInput,
  BackgroundInfoInput,
  ChangePasswordInput
} from '../validators/profile';
import { verifyPassword, hashPassword } from '../utils/auth';
import { serializeBigInt } from '@/lib/utils';
import { ApiResponse, Student, StudentSchool, StudentDocument } from '../types';

/**
 * Service to handle student profile management, education history, and documents.
 * Ported from StudentProfileApi.php
 */
export class StudentProfileService {
  private static instance: StudentProfileService;

  private constructor() {}

  static getInstance(): StudentProfileService {
    if (!StudentProfileService.instance) {
      StudentProfileService.instance = new StudentProfileService();
    }
    return StudentProfileService.instance;
  }

  /**
   * Get full student profile.
   */
  async getProfile(studentId: number): Promise<ApiResponse<{ student: Student }>> {
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT * FROM leads WHERE id = ? LIMIT 1',
      studentId,
    )) as any[];
    const student = rows[0] || null;

    if (!student) {
      return { status: false, message: 'Student not found.' };
    }

    return {
      status: true,
      message: 'Profile fetched successfully.',
      data: { student: serializeBigInt(student) as unknown as Student },
    };
  }

  /**
   * Update personal information.
   */
  async updatePersonalInfo(studentId: number, input: PersonalInfoInput): Promise<ApiResponse> {
    const dob = input.dob ? new Date(input.dob as any) : null;
    const passportExpiry = input.passport_expiry ? new Date(input.passport_expiry as any) : null;
    const zipcode =
      typeof input.zipcode === 'string' ? parseInt(input.zipcode || '0', 10) : input.zipcode;

    await prisma.$executeRawUnsafe(
      `UPDATE leads SET
        name = ?,
        email = ?,
        country_code = ?,
        mobile = ?,
        father = ?,
        mother = ?,
        dob = ?,
        first_language = ?,
        nationality = ?,
        passport_number = ?,
        passport_expiry = ?,
        marital_status = ?,
        gender = ?,
        home_address = ?,
        city = ?,
        state = ?,
        country = ?,
        zipcode = ?,
        home_contact_number = ?,
        updated_at = NOW()
      WHERE id = ?`,
      input.name,
      input.email,
      input.country_code,
      input.mobile,
      input.father,
      input.mother,
      dob,
      input.first_language,
      input.nationality,
      input.passport_number,
      passportExpiry,
      input.marital_status,
      input.gender,
      input.home_address,
      input.city ?? null,
      input.state ?? null,
      input.country ?? null,
      zipcode as any,
      input.home_contact_number,
      studentId,
    );

    return { status: true, message: 'Personal information updated successfully' };
  }

  /**
   * Update education summary.
   */
  async updateEduSum(studentId: number, input: EduSummaryInput): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET country_of_education = ?,
           highest_level_of_education = ?,
           grading_scheme = ?,
           grade_average = ?,
           updated_at = NOW()
       WHERE id = ?`,
      input.country_of_education,
      input.highest_level_of_education,
      input.grading_scheme,
      input.grade_average,
      Number(studentId),
    );

    return { status: true, message: 'Education summary updated successfully' };
  }

  /**
   * Get student schools.
   */
  async getSchools(studentId: number): Promise<ApiResponse<{ schools: StudentSchool[] }>> {
    const schools = (await prisma.$queryRawUnsafe(
      `SELECT *
       FROM student_schools
       WHERE std_id = ?
       ORDER BY id DESC`,
      Number(studentId),
    )) as any[];

    return {
      status: true,
      message: 'Schools fetched successfully.',
      data: { schools: serializeBigInt(schools) as unknown as StudentSchool[] },
    };
  }

  /**
   * Add new school.
   */
  async addSchool(studentId: number, input: SchoolInput): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `INSERT INTO student_schools (
          std_id,
          country_of_institution,
          name_of_institution,
          level_of_education,
          primary_language_of_instruction,
          attended_institution_from,
          attended_institution_to,
          graduation_date,
          degree_name,
          graduated_from_this,
          address,
          city,
          state,
          zipcode,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      Number(studentId),
      input.country_of_institution,
      input.name_of_institution,
      input.level_of_education,
      input.primary_language_of_instruction,
      input.attended_institution_from ? new Date(input.attended_institution_from as any) : null,
      input.attended_institution_to ? new Date(input.attended_institution_to as any) : null,
      (input as any).graduation_date ? new Date((input as any).graduation_date) : null,
      input.degree_name,
      input.graduated_from_this ? 1 : 0,
      input.address,
      input.city,
      input.state ?? '',
      String(input.zipcode ?? ''),
    );

    return { status: true, message: 'School added successfully' };
  }

  /**
   * Update school.
   */
  async updateSchool(studentId: number, input: SchoolInput): Promise<ApiResponse> {
    if (!input.id) return { status: false, message: 'School ID is required for update.' };

    await prisma.$executeRawUnsafe(
      `UPDATE student_schools
       SET country_of_institution = ?,
           name_of_institution = ?,
           level_of_education = ?,
           primary_language_of_instruction = ?,
           attended_institution_from = ?,
           attended_institution_to = ?,
           graduation_date = ?,
           degree_name = ?,
           graduated_from_this = ?,
           address = ?,
           city = ?,
           state = ?,
           zipcode = ?,
           updated_at = NOW()
       WHERE id = ? AND std_id = ?`,
      input.country_of_institution,
      input.name_of_institution,
      input.level_of_education,
      input.primary_language_of_instruction,
      input.attended_institution_from ? new Date(input.attended_institution_from as any) : null,
      input.attended_institution_to ? new Date(input.attended_institution_to as any) : null,
      (input as any).graduation_date ? new Date((input as any).graduation_date) : null,
      input.degree_name,
      input.graduated_from_this ? 1 : 0,
      input.address,
      input.city,
      input.state ?? '',
      String(input.zipcode ?? ''),
      Number(input.id),
      Number(studentId),
    );

    return { status: true, message: 'School updated successfully' };
  }

  /**
   * Delete school.
   */
  async deleteSchool(studentId: number, schoolId: number): Promise<ApiResponse> {
    const school = (await prisma.$queryRawUnsafe(
      `SELECT id
       FROM student_schools
       WHERE id = ? AND std_id = ?
       LIMIT 1`,
      Number(schoolId),
      Number(studentId),
    )) as any[];

    if (!school.length) {
      return { status: false, message: 'School record not found' };
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM student_schools
       WHERE id = ? AND std_id = ?`,
      Number(schoolId),
      Number(studentId),
    );

    return { status: true, message: 'School record deleted successfully' };
  }

  /**
   * Get single school by id.
   */
  async getSchool(studentId: number, schoolId: number): Promise<ApiResponse<{ school: StudentSchool }>> {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT *
       FROM student_schools
       WHERE id = ? AND std_id = ?
       LIMIT 1`,
      Number(schoolId),
      Number(studentId),
    )) as any[];

    const school = rows[0];
    if (!school) return { status: false, message: 'School record not found' };

    return {
      status: true,
      message: 'School fetched successfully.',
      data: { school: serializeBigInt(school) as unknown as StudentSchool },
    };
  }

  /**
   * Update generic test scores (IELTS, TOEFL, etc.)
   */
  async updateTestScore(studentId: number, input: TestScoreInput): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET english_exam_type = ?,
           date_of_exam = ?,
           speaking_score = ?,
           listening_score = ?,
           reading_score = ?,
           writing_score = ?,
           overall_score = ?,
           updated_at = NOW()
       WHERE id = ?`,
      input.english_exam_type,
      input.date_of_exam ? new Date(input.date_of_exam as any) : null,
      input.speaking_score != null ? String(input.speaking_score) : null,
      input.listening_score != null ? String(input.listening_score) : null,
      input.reading_score != null ? String(input.reading_score) : null,
      input.writing_score != null ? String(input.writing_score) : null,
      input.overall_score != null ? String(input.overall_score) : null,
      Number(studentId),
    );

    return { status: true, message: 'Test Score updated successfully' };
  }

  /**
   * Update GRE scores.
   */
  async updateGRE(studentId: number, input: GreInput): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET gre = 1,
           gre_exam_date = ?,
           gre_v_score = ?,
           gre_v_rank = ?,
           gre_q_score = ?,
           gre_q_rank = ?,
           gre_w_score = ?,
           gre_w_rank = ?,
           updated_at = NOW()
       WHERE id = ?`,
      new Date(input.gre_exam_date as any),
      String(input.gre_v_score),
      String(input.gre_v_rank),
      String(input.gre_q_score),
      String(input.gre_q_rank),
      String(input.gre_w_score),
      String(input.gre_w_rank),
      Number(studentId),
    );

    return { status: true, message: 'GRE score updated successfully' };
  }

  /**
   * Update GMAT scores.
   */
  async updateGMAT(studentId: number, input: GmatInput): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET gmat = 1,
           gmat_exam_date = ?,
           gmat_v_score = ?,
           gmat_v_rank = ?,
           gmat_q_score = ?,
           gmat_q_rank = ?,
           gmat_w_score = ?,
           gmat_w_rank = ?,
           gmat_ir_score = ?,
           gmat_ir_rank = ?,
           gmat_total_score = ?,
           gmat_total_rank = ?,
           updated_at = NOW()
       WHERE id = ?`,
      new Date(input.gmat_exam_date as any),
      String(input.gmat_v_score),
      String(input.gmat_v_rank),
      String(input.gmat_q_score),
      String(input.gmat_q_rank),
      String(input.gmat_w_score),
      String(input.gmat_w_rank),
      String(input.gmat_ir_score),
      String(input.gmat_ir_rank),
      String(input.gmat_total_score),
      String(input.gmat_total_rank),
      Number(studentId),
    );

    return { status: true, message: 'GMAT score updated successfully' };
  }

  /**
   * Update SAT scores.
   */
  async updateSAT(studentId: number, input: SatInput): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET sat = 1,
           sat_exam_date = ?,
           sat_reasoning_point = ?,
           sat_subject_point = ?,
           updated_at = NOW()
       WHERE id = ?`,
      new Date(input.sat_exam_date as any),
      String(input.sat_reasoning_point),
      String(input.sat_subject_point),
      Number(studentId),
    );

    return { status: true, message: 'SAT score updated successfully' };
  }

  /**
   * Update background information.
   */
  async updateBackgroundInfo(studentId: number, input: BackgroundInfoInput): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET refused_visa = ?,
           valid_study_permit = ?,
           visa_note = ?,
           updated_at = NOW()
       WHERE id = ?`,
      input.refused_visa,
      input.valid_study_permit,
      input.visa_note,
      Number(studentId),
    );

    return { status: true, message: 'Background info updated successfully' };
  }

  /**
   * Get student documents.
   */
  async getDocuments(studentId: number): Promise<ApiResponse<{ student_documents: StudentDocument[] }>> {
    const docs = (await prisma.$queryRawUnsafe(
      `SELECT id, std_id, doc_name, imgname, imgpath, upload_source, doc_status, status, created_at, updated_at
       FROM student_documents
       WHERE std_id = ?
       ORDER BY id DESC`,
      Number(studentId),
    )) as any[];

    return {
      status: true,
      message: 'Documents fetched successfully.',
      data: { student_documents: serializeBigInt(docs) as unknown as StudentDocument[] },
    };
  }

  /**
   * Add document record.
   */
  async addDocument(studentId: number, docName: string, imgName: string, imgPath: string, siteUrl: string): Promise<ApiResponse> {
    await prisma.$executeRawUnsafe(
      `INSERT INTO student_documents (std_id, doc_name, imgname, imgpath, upload_source, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      Number(studentId),
      docName,
      imgName,
      imgPath,
      siteUrl,
    );

    return { status: true, message: 'Document uploaded successfully' };
  }

  /**
   * Get applied programs.
   */
  async getAppliedPrograms(studentId: number): Promise<ApiResponse<{ applied_programs: any[] }>> {
    const apps = (await prisma.$queryRawUnsafe(
      `SELECT 
          sa.id,
          sa.stdid,
          sa.prog_id,
          sa.status,
          sa.app_status,
          sa.created_at,
          sa.updated_at,
          up.id AS program_id,
          up.course_name,
          up.level,
          up.duration,
          up.study_mode,
          up.intake,
          up.application_deadline,
          up.university_id,
          u.id AS university_ref_id,
          u.name AS university_name
       FROM student_applications sa
       LEFT JOIN university_programs up ON up.id = sa.prog_id
       LEFT JOIN universities u ON u.id = up.university_id
       WHERE sa.stdid = ? AND sa.status = 1
       ORDER BY sa.id DESC`,
      Number(studentId),
    )) as any[];

    const mapped = apps.map((row: any) => {
      const universityProgram = {
        id: row.program_id ?? row.prog_id,
        course_name: row.course_name,
        level: row.level,
        duration: row.duration,
        study_mode: row.study_mode,
        intake: row.intake,
        application_deadline: row.application_deadline,
        university_id: row.university_id,
        university: {
          id: row.university_ref_id,
          name: row.university_name,
        },
      };
      return {
        id: row.id,
        stdid: row.stdid,
        prog_id: row.prog_id,
        status: row.status,
        app_status: row.app_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        university_program: universityProgram,
        university_programs: universityProgram,
      };
    });

    return {
      status: true,
      message: 'Applied programs fetched successfully.',
      data: { applied_programs: serializeBigInt(mapped) },
    };
  }

  /**
   * Get shortlisted (inactive) programs.
   */
  async getShortlistedPrograms(studentId: number): Promise<ApiResponse<{ shortlisted_programs: any[] }>> {
    const apps = (await prisma.$queryRawUnsafe(
      `SELECT 
          sa.id,
          sa.stdid,
          sa.prog_id,
          sa.status,
          sa.app_status,
          sa.created_at,
          sa.updated_at,
          up.id AS program_id,
          up.course_name,
          up.level,
          up.duration,
          up.study_mode,
          up.intake,
          up.application_deadline,
          up.university_id,
          u.id AS university_ref_id,
          u.name AS university_name
       FROM student_applications sa
       LEFT JOIN university_programs up ON up.id = sa.prog_id
       LEFT JOIN universities u ON u.id = up.university_id
       WHERE sa.stdid = ? AND sa.status = 0
       ORDER BY sa.id DESC`,
      Number(studentId),
    )) as any[];

    const mapped = apps.map((row: any) => {
      const universityProgram = {
        id: row.program_id ?? row.prog_id,
        course_name: row.course_name,
        level: row.level,
        duration: row.duration,
        study_mode: row.study_mode,
        intake: row.intake,
        application_deadline: row.application_deadline,
        university_id: row.university_id,
        university: {
          id: row.university_ref_id,
          name: row.university_name,
        },
      };
      return {
        id: row.id,
        stdid: row.stdid,
        prog_id: row.prog_id,
        status: row.status,
        app_status: row.app_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        university_program: universityProgram,
        university_programs: universityProgram,
      };
    });

    return {
      status: true,
      message: 'Shortlisted programs fetched successfully.',
      data: { shortlisted_programs: serializeBigInt(mapped) },
    };
  }

  /**
   * Change password.
   */
  async changePassword(studentId: number, input: ChangePasswordInput): Promise<ApiResponse> {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT id, password
       FROM leads
       WHERE id = ?
       LIMIT 1`,
      Number(studentId),
    )) as any[];
    const student = rows[0];

    if (!student) {
      return { status: false, message: 'Student not found.' };
    }

    const storedPassword = String(student.password || '');
    const isMatch = await verifyPassword(input.old_password, storedPassword);
    if (!isMatch) {
      return { status: false, message: 'The old password is incorrect.' };
    }

    const hashedPassword = await hashPassword(input.new_password);
    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET password = ?, updated_at = NOW()
       WHERE id = ?`,
      hashedPassword,
      Number(studentId),
    );

    return { status: true, message: 'Password has been changed successfully.' };
  }
}

export const studentProfileService = StudentProfileService.getInstance();
