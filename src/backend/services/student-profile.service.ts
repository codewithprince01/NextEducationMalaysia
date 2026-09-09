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
    try {
      const maxRes = (await prisma.$queryRawUnsafe(
        `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM student_schools`
      )) as Array<{ next_id: bigint | number }>;
      const nextId = Number(maxRes[0]?.next_id ?? 1);

      await prisma.$executeRawUnsafe(
        `INSERT INTO student_schools (
            id,
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        nextId,
        Number(studentId),
        input.country_of_institution || '',
        input.name_of_institution || '',
        input.level_of_education || '',
        input.primary_language_of_instruction || '',
        input.attended_institution_from ? new Date(input.attended_institution_from as any) : null,
        input.attended_institution_to ? new Date(input.attended_institution_to as any) : null,
        (input as any).graduation_date ? new Date((input as any).graduation_date) : null,
        input.degree_name || '',
        input.graduated_from_this ? 1 : 0,
        input.address || '',
        input.city || '',
        input.state ?? '',
        String(input.zipcode ?? ''),
      );

      return { status: true, message: 'School added successfully' };
    } catch (error: any) {
      console.error('Error adding school:', error);
      return { status: false, message: error?.message || 'Failed to add school' };
    }
  }

  /**
   * Update school.
   */
  async updateSchool(studentId: number, input: SchoolInput): Promise<ApiResponse> {
    if (!input.id) return { status: false, message: 'School ID is required for update.' };

    try {
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
        input.country_of_institution || '',
        input.name_of_institution || '',
        input.level_of_education || '',
        input.primary_language_of_instruction || '',
        input.attended_institution_from ? new Date(input.attended_institution_from as any) : null,
        input.attended_institution_to ? new Date(input.attended_institution_to as any) : null,
        (input as any).graduation_date ? new Date((input as any).graduation_date) : null,
        input.degree_name || '',
        input.graduated_from_this ? 1 : 0,
        input.address || '',
        input.city || '',
        input.state ?? '',
        String(input.zipcode ?? ''),
        Number(input.id),
        Number(studentId),
      );

      return { status: true, message: 'School updated successfully' };
    } catch (error: any) {
      console.error('Error updating school:', error);
      return { status: false, message: error?.message || 'Failed to update school' };
    }
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
  async getDocuments(studentId: number): Promise<ApiResponse<{ student_documents: StudentDocument[]; student_requirements: any[] }>> {
    const docs = (await prisma.$queryRawUnsafe(
      `SELECT id, std_id, doc_name, imgname, imgpath, upload_source, doc_status, status, created_at, updated_at
       FROM student_documents
       WHERE std_id = ?
       ORDER BY id DESC`,
      Number(studentId),
    )) as any[];

    let reqs: any[] = [];
    try {
      reqs = (await prisma.$queryRawUnsafe(
        `SELECT DISTINCT title, tag, stage_tag, action_type, doc_status, rejection_note FROM application_requirements WHERE std_id = ?`,
        Number(studentId),
      )) as any[];
    } catch (e) {
      reqs = [];
    }

    return {
      status: true,
      message: 'Documents fetched successfully.',
      data: {
        student_documents: serializeBigInt(docs) as unknown as StudentDocument[],
        student_requirements: serializeBigInt(reqs) as unknown as any[],
      },
    };
  }

  /**
   * Add document record.
   */
  async addDocument(studentId: number, docName: string, imgName: string, imgPath: string, siteUrl: string): Promise<ApiResponse> {
    try {
      const maxRes = (await prisma.$queryRawUnsafe(
        `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM student_documents`
      )) as Array<{ next_id: bigint | number }>;
      const nextId = Number(maxRes[0]?.next_id ?? 1);

      await prisma.$executeRawUnsafe(
        `INSERT INTO student_documents (id, std_id, doc_name, imgname, imgpath, upload_source, doc_status, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'Reviewing', 1, NOW(), NOW())`,
        nextId,
        Number(studentId),
        docName,
        imgName,
        imgPath,
        siteUrl,
      );

      // Sync application_requirements status to 'Reviewing'
      const cleanTitle = (docName || '').trim().toLowerCase();
      if (cleanTitle) {
        await prisma.$executeRawUnsafe(
          `UPDATE application_requirements 
           SET doc_status = 'Reviewing', rejection_note = NULL 
           WHERE std_id = ? AND (
             LOWER(TRIM(title)) = ? OR 
             LOWER(TRIM(title)) LIKE CONCAT('%', ?, '%') OR 
             ? LIKE CONCAT('%', LOWER(TRIM(title)), '%')
           )`,
          Number(studentId),
          cleanTitle,
          cleanTitle,
          cleanTitle
        );
      }

      return { status: true, message: 'Document uploaded successfully' };
    } catch (err: any) {
      console.error('Error in addDocument with explicit ID:', err);
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
          sa.stage,
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
        stage: row.stage,
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
          sa.stage,
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
        stage: row.stage,
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

  /**
   * Fetch dynamic pipeline stages (Admission Journey Pipeline).
   */
  async getPipelineStages(): Promise<ApiResponse<{ stages: any[] }>> {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS application_stages (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(191) NOT NULL,
          position INT NOT NULL DEFAULT 0,
          description TEXT NULL,
          status INT DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const rows = (await prisma.$queryRawUnsafe(
        `SELECT id, name, position, description, status FROM application_stages WHERE status = 1 ORDER BY position ASC, id ASC`
      )) as any[];

      if (rows.length === 0) {
        const defaults = [
          { id: 1, name: 'Application created', position: 1, description: 'Application record created' },
          { id: 2, name: 'Application Started', position: 2, description: 'Application process started' },
          { id: 3, name: 'Application Review (By Education Malaysia)', position: 3, description: 'Under review by Education Malaysia' },
          { id: 4, name: 'Submitting to School', position: 4, description: 'Submitted to university portal' },
          { id: 5, name: 'Awaiting School Decision', position: 5, description: 'Admissions committee review' },
          { id: 6, name: 'Admission Processing', position: 6, description: 'Offer letter processing' },
          { id: 7, name: 'Pre-Arrival', position: 7, description: 'EMGS Visa approval' },
          { id: 8, name: 'Arrival', position: 8, description: 'Arrival in Malaysia' },
        ];
        return { status: true, data: { stages: defaults }, message: 'Default stages' };
      }

      const mapped = rows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        position: Number(r.position),
        description: r.description,
        status: Number(r.status ?? 1),
      }));

      return { status: true, data: { stages: mapped }, message: 'Stages fetched successfully' };
    } catch (err: any) {
      console.error('Error fetching pipeline stages:', err);
      const defaults = [
        { id: 1, name: 'Application created', position: 1 },
        { id: 2, name: 'Application Started', position: 2 },
        { id: 3, name: 'Application Review (By Education Malaysia)', position: 3 },
        { id: 4, name: 'Submitting to School', position: 4 },
        { id: 5, name: 'Awaiting School Decision', position: 5 },
        { id: 6, name: 'Admission Processing', position: 6 },
        { id: 7, name: 'Pre-Arrival', position: 7 },
        { id: 8, name: 'Arrival', position: 8 },
      ];
      return { status: true, data: { stages: defaults }, message: 'Fallback default stages' };
    }
  }

  /**
   * Fetch dynamic requirements for an application.
   */
  async getApplicationRequirements(appId: number): Promise<ApiResponse<{ requirements: any[] }>> {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS application_requirements (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          app_id BIGINT UNSIGNED NOT NULL,
          std_id BIGINT UNSIGNED NOT NULL,
          title VARCHAR(255) NOT NULL,
          tag VARCHAR(50) DEFAULT 'Required',
          stage_tag VARCHAR(50) DEFAULT 'Before payment',
          action_type VARCHAR(50) DEFAULT 'upload',
          doc_status VARCHAR(50) DEFAULT 'Pending',
          rejection_note TEXT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX (app_id),
          INDEX (std_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      let rows = (await prisma.$queryRawUnsafe(
        `SELECT id, app_id, std_id, title, tag, stage_tag, action_type, doc_status, rejection_note, created_at FROM application_requirements WHERE app_id = ? ORDER BY id ASC`,
        Number(appId)
      )) as any[];

      const app = (await prisma.$queryRawUnsafe(
        `SELECT stdid FROM student_applications WHERE id = ?`,
        Number(appId)
      )) as any[];
      const stdId = app[0]?.stdid ?? 0;

      if (rows.length === 0) {
        // Check if student has requirements from another application or student-level creation
        const existingStdReqs = (await prisma.$queryRawUnsafe(
          `SELECT DISTINCT title, tag, stage_tag, action_type, doc_status, rejection_note FROM application_requirements WHERE std_id = ?`,
          Number(stdId)
        )) as any[];

        if (existingStdReqs.length > 0) {
          for (const req of existingStdReqs) {
            await prisma.$executeRawUnsafe(
              `INSERT INTO application_requirements (app_id, std_id, title, tag, stage_tag, action_type, doc_status, rejection_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              Number(appId),
              Number(stdId),
              req.title,
              req.tag || 'Required',
              req.stage_tag || 'Before payment',
              req.action_type || 'upload',
              req.doc_status || 'Pending',
              req.rejection_note || null
            );
          }
        } else {
          const defaults = [
            { title: 'International Passport Copy', tag: 'Required', stage_tag: 'Before payment', action_type: 'upload' },
            { title: 'Grade 12 / High School Certificate & Transcript', tag: 'Required', stage_tag: 'Before payment', action_type: 'upload' },
            { title: 'Passport-Sized Photograph (White Background)', tag: 'Required', stage_tag: 'Before payment', action_type: 'upload' },
            { title: 'Grade 10 / Secondary School Certificate', tag: 'Required', stage_tag: 'Before payment', action_type: 'upload' },
            { title: 'English Language Proficiency Proof', tag: 'Required', stage_tag: 'Before payment', action_type: 'upload' },
            { title: 'Resume / Curriculum Vitae (CV)', tag: 'Optional now, required later', stage_tag: 'Before visa', action_type: 'upload' },
            { title: 'Health Declaration Form', tag: 'Optional now, required later', stage_tag: 'Before visa', action_type: 'upload' },
            { title: 'Parent Details & Date of Birth', tag: 'Required', stage_tag: 'Profile', action_type: 'profile' },
          ];

          for (const req of defaults) {
            await prisma.$executeRawUnsafe(
              `INSERT INTO application_requirements (app_id, std_id, title, tag, stage_tag, action_type, doc_status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
              Number(appId),
              Number(stdId),
              req.title,
              req.tag,
              req.stage_tag,
              req.action_type
            );
          }
        }

        rows = (await prisma.$queryRawUnsafe(
          `SELECT id, app_id, std_id, title, tag, stage_tag, action_type, doc_status, rejection_note, created_at FROM application_requirements WHERE app_id = ? ORDER BY id ASC`,
          Number(appId)
        )) as any[];
      } else if (stdId > 0) {
        // Sync any newly added student requirements that may be missing from this app_id
        const missingReqs = (await prisma.$queryRawUnsafe(
          `SELECT DISTINCT title, tag, stage_tag, action_type FROM application_requirements WHERE std_id = ? AND LOWER(TRIM(title)) NOT IN (SELECT LOWER(TRIM(title)) FROM application_requirements WHERE app_id = ?)`,
          Number(stdId),
          Number(appId)
        )) as any[];

        for (const req of missingReqs) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO application_requirements (app_id, std_id, title, tag, stage_tag, action_type, doc_status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            Number(appId),
            Number(stdId),
            req.title,
            req.tag || 'Required',
            req.stage_tag || 'Before payment',
            req.action_type || 'upload'
          );
        }

        if (missingReqs.length > 0) {
          rows = (await prisma.$queryRawUnsafe(
            `SELECT id, app_id, std_id, title, tag, stage_tag, action_type, doc_status, rejection_note, created_at FROM application_requirements WHERE app_id = ? ORDER BY id ASC`,
            Number(appId)
          )) as any[];
        }
      }

      const mapped = rows.map((r: any) => ({
        id: Number(r.id),
        app_id: Number(r.app_id),
        std_id: Number(r.std_id),
        title: r.title,
        tag: r.tag || 'Required',
        stage_tag: r.stage_tag || 'Before payment',
        action_type: r.action_type || 'upload',
        doc_status: r.doc_status || 'Pending',
        rejection_note: r.rejection_note || null,
        created_at: r.created_at,
      }));

      return { status: true, data: { requirements: mapped }, message: 'Requirements fetched successfully' };
    } catch (err: any) {
      console.error('Error fetching application requirements:', err);
      return { status: true, data: { requirements: [] }, message: 'Failed to fetch requirements' };
    }
  }

  /**
   * Fetch student conversation messages with advisors / admins.
   */
  async getConversation(studentId: number) {
    const stdKey = `std_${studentId}`;
    const altKey = `student_${studentId}`;

    try {
      const rows = (await prisma.$queryRawUnsafe(
        `SELECT id, sender, receiver, msg, senddate, created_at
         FROM chats
         WHERE sender = ? OR receiver = ? OR sender = ? OR receiver = ?
         ORDER BY id ASC`,
        stdKey,
        stdKey,
        altKey,
        altKey
      )) as any[];

      if (rows.length === 0) {
        return {
          status: true,
          message: 'Conversation fetched.',
          data: {
            messages: [
              {
                id: 1,
                sender: 'admin',
                senderName: 'Admissions Desk',
                text: 'Welcome to your Student & Advisor Communication Desk! Feel free to ask any questions regarding your application.',
                time: '10:00 AM',
                isStudent: false,
              },
            ],
          },
        };
      }

      const messages = rows.map((r: any) => {
        const senderStr = String(r.sender || '');
        const isStudent =
          senderStr.startsWith('std_') ||
          senderStr.startsWith('student_') ||
          senderStr === 'student';

        const dt = r.created_at ? new Date(r.created_at) : r.senddate ? new Date(r.senddate) : new Date();
        const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return {
          id: Number(r.id),
          sender: isStudent ? 'student' : 'admin',
          senderName: isStudent ? 'Student' : senderStr || 'Admissions Desk',
          text: r.msg,
          time: timeStr,
          isStudent,
          createdAt: r.created_at || r.senddate,
        };
      });

      return {
        status: true,
        message: 'Conversation fetched successfully.',
        data: { messages: serializeBigInt(messages) },
      };
    } catch (err: any) {
      console.error('Error fetching conversation:', err);
      return {
        status: true,
        message: 'Default conversation loaded.',
        data: {
          messages: [
            {
              id: 1,
              sender: 'admin',
              senderName: 'Admissions Desk',
              text: 'Welcome to your Student & Advisor Communication Desk! Feel free to ask any questions.',
              time: '10:00 AM',
              isStudent: false,
            },
          ],
        },
      };
    }
  }

  /**
   * Send a student message in conversation desk.
   */
  async sendChatMessage(studentId: number, messageText: string) {
    if (!messageText || !messageText.trim()) {
      return { status: false, message: 'Message text cannot be empty.' };
    }
    const stdKey = `std_${studentId}`;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO chats (sender, receiver, msg, senddate, readdate, status, notif, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW(), 0, 0, NOW(), NOW())`,
        stdKey,
        'admin',
        messageText.trim()
      );
      return { status: true, message: 'Message sent successfully.' };
    } catch (err: any) {
      console.warn('First insert attempt in sendChatMessage failed, retrying with explicit ID generation:', err?.message);
      try {
        const maxRes = (await prisma.$queryRawUnsafe(
          `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM chats`
        )) as Array<{ next_id: bigint | number }>;
        const nextId = Number(maxRes[0]?.next_id ?? 1);

        await prisma.$executeRawUnsafe(
          `INSERT INTO chats (id, sender, receiver, msg, senddate, readdate, status, notif, created_at, updated_at)
           VALUES (?, ?, ?, ?, NOW(), NOW(), 0, 0, NOW(), NOW())`,
          nextId,
          stdKey,
          'admin',
          messageText.trim()
        );
        return { status: true, message: 'Message sent successfully.' };
      } catch (innerErr: any) {
        console.error('Error inserting chat message with explicit ID:', innerErr);
        return { status: false, message: innerErr.message || 'Failed to send message.' };
      }
    }
  }

  /**
   * Update dynamic requirement status (e.g. set to 'Reviewing' when student re-uploads).
   */
  async updateRequirementStatus(reqId: number, status: string) {
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE application_requirements SET doc_status = ? WHERE id = ?`,
        status,
        Number(reqId)
      );
      return { status: true, message: 'Requirement status updated' };
    } catch (err: any) {
      console.error('Error updating requirement status:', err);
      return { status: false, message: err.message || 'Failed to update requirement status' };
    }
  }
}

export const studentProfileService = StudentProfileService.getInstance();


