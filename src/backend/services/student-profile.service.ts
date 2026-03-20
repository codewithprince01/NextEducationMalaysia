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
    const student = await prisma.leads.findUnique({
      where: { id: BigInt(studentId) },
    });

    if (!student) {
      return { status: false, message: 'Student not found.' };
    }

    return {
      status: 1,
      message: 'Profile fetched successfully.',
      data: { student: serializeBigInt(student) as unknown as Student },
    };
  }

  /**
   * Update personal information.
   */
  async updatePersonalInfo(studentId: number, input: PersonalInfoInput): Promise<ApiResponse> {
    await prisma.leads.update({
      where: { id: BigInt(studentId) },
      data: {
        ...input,
        dob: input.dob ? new Date(input.dob) : null,
        passport_expiry: input.passport_expiry ? new Date(input.passport_expiry) : null,
        zipcode: typeof input.zipcode === 'string' ? parseInt(input.zipcode) : input.zipcode,
      },
    });

    return { status: 1, message: 'Personal information updated successfully' };
  }

  /**
   * Update education summary.
   */
  async updateEduSum(studentId: number, input: EduSummaryInput): Promise<ApiResponse> {
    await prisma.leads.update({
      where: { id: BigInt(studentId) },
      data: input,
    });

    return { status: 1, message: 'Education summary updated successfully' };
  }

  /**
   * Get student schools.
   */
  async getSchools(studentId: number): Promise<ApiResponse<{ schools: StudentSchool[] }>> {
    const schools = await prisma.student_schools.findMany({
      where: { std_id: BigInt(studentId) },
    });

    return {
      status: 1,
      message: 'Schools fetched successfully.',
      data: { schools: serializeBigInt(schools) as unknown as StudentSchool[] },
    };
  }

  /**
   * Add new school.
   */
  async addSchool(studentId: number, input: SchoolInput): Promise<ApiResponse> {
    await prisma.student_schools.create({
      data: {
        std_id: BigInt(studentId),
        ...input,
        attended_institution_from: new Date(input.attended_institution_from),
        attended_institution_to: new Date(input.attended_institution_to),
        zipcode: input.zipcode.toString(),
        graduated_from_this: Boolean(input.graduated_from_this),
      },
    });

    return { status: true, message: 'School added successfully' };
  }

  /**
   * Update school.
   */
  async updateSchool(studentId: number, input: SchoolInput): Promise<ApiResponse> {
    if (!input.id) return { status: false, message: 'School ID is required for update.' };

    await prisma.student_schools.update({
      where: { id: BigInt(input.id) },
      data: {
        ...input,
        id: undefined, // Don't update the ID
        attended_institution_from: new Date(input.attended_institution_from),
        attended_institution_to: new Date(input.attended_institution_to),
        zipcode: input.zipcode.toString(),
        graduated_from_this: Boolean(input.graduated_from_this),
      },
    });

    return { status: true, message: 'School updated successfully' };
  }

  /**
   * Delete school.
   */
  async deleteSchool(studentId: number, schoolId: number): Promise<ApiResponse> {
    const school = await prisma.student_schools.findFirst({
      where: { id: BigInt(schoolId), std_id: BigInt(studentId) },
    });

    if (!school) {
      return { status: false, message: 'School record not found' };
    }

    await prisma.student_schools.delete({
      where: { id: BigInt(schoolId) },
    });

    return { status: true, message: 'School record deleted successfully' };
  }

  /**
   * Update generic test scores (IELTS, TOEFL, etc.)
   */
  async updateTestScore(studentId: number, input: TestScoreInput): Promise<ApiResponse> {
    await prisma.leads.update({
      where: { id: BigInt(studentId) },
      data: {
        ...input,
        date_of_exam: input.date_of_exam ? new Date(input.date_of_exam) : null,
        speaking_score: input.speaking_score?.toString(),
        listening_score: input.listening_score?.toString(),
        reading_score: input.reading_score?.toString(),
        writing_score: input.writing_score?.toString(),
        overall_score: input.overall_score?.toString(),
      },
    });

    return { status: true, message: 'Test Score updated successfully' };
  }

  /**
   * Update GRE scores.
   */
  async updateGRE(studentId: number, input: GreInput): Promise<ApiResponse> {
    await prisma.leads.update({
      where: { id: BigInt(studentId) },
      data: {
        ...input,
        gre: true,
        gre_exam_date: new Date(input.gre_exam_date),
        gre_v_score: input.gre_v_score.toString(),
        gre_v_rank: input.gre_v_rank.toString(),
        gre_q_score: input.gre_q_score.toString(),
        gre_q_rank: input.gre_q_rank.toString(),
        gre_w_score: input.gre_w_score.toString(),
        gre_w_rank: input.gre_w_rank.toString(),
      },
    });

    return { status: true, message: 'GRE score updated successfully' };
  }

  /**
   * Update GMAT scores.
   */
  async updateGMAT(studentId: number, input: GmatInput): Promise<ApiResponse> {
    await prisma.leads.update({
      where: { id: BigInt(studentId) },
      data: {
        ...input,
        gmat: true,
        gmat_exam_date: new Date(input.gmat_exam_date),
        gmat_v_score: input.gmat_v_score.toString(),
        gmat_v_rank: input.gmat_v_rank.toString(),
        gmat_q_score: input.gmat_q_score.toString(),
        gmat_q_rank: input.gmat_q_rank.toString(),
        gmat_w_score: input.gmat_w_score.toString(),
        gmat_w_rank: input.gmat_w_rank.toString(),
        gmat_ir_score: input.gmat_ir_score.toString(),
        gmat_ir_rank: input.gmat_ir_rank.toString(),
        gmat_total_score: input.gmat_total_score.toString(),
        gmat_total_rank: input.gmat_total_rank.toString(),
      },
    });

    return { status: true, message: 'GMAT score updated successfully' };
  }

  /**
   * Update SAT scores.
   */
  async updateSAT(studentId: number, input: SatInput): Promise<ApiResponse> {
    await prisma.leads.update({
      where: { id: BigInt(studentId) },
      data: {
        ...input,
        sat: true,
        sat_exam_date: new Date(input.sat_exam_date),
        sat_reasoning_point: input.sat_reasoning_point.toString(),
        sat_subject_point: input.sat_subject_point.toString(),
      },
    });

    return { status: true, message: 'SAT score updated successfully' };
  }

  /**
   * Update background information.
   */
  async updateBackgroundInfo(studentId: number, input: BackgroundInfoInput): Promise<ApiResponse> {
    await prisma.leads.update({
      where: { id: BigInt(studentId) },
      data: input,
    });

    return { status: true, message: 'Background info updated successfully' };
  }

  /**
   * Get student documents.
   */
  async getDocuments(studentId: number): Promise<ApiResponse<{ student_documents: StudentDocument[] }>> {
    const docs = await prisma.student_documents.findMany({
      where: { std_id: BigInt(studentId) },
    });

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
    await prisma.student_documents.create({
      data: {
        std_id: BigInt(studentId),
        doc_name: docName,
        imgname: imgName,
        imgpath: imgPath,
        upload_source: siteUrl,
        status: true,
      },
    });

    return { status: true, message: 'Document uploaded successfully' };
  }

  /**
   * Get applied programs.
   */
  async getAppliedPrograms(studentId: number): Promise<ApiResponse<{ applied_programs: any[] }>> {
    const apps = await prisma.student_applications.findMany({
      where: { 
        stdid: BigInt(studentId),
        status: true, // Active scope
      },
      include: {
        university_programs: {
          select: {
            id: true,
            course_name: true,
            level: true,
            duration: true,
            study_mode: true,
            intake: true,
            application_deadline: true,
            university_id: true,
            university: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      status: true,
      message: 'Applied programs fetched successfully.',
      data: { applied_programs: serializeBigInt(apps) },
    };
  }

  /**
   * Get shortlisted (inactive) programs.
   */
  async getShortlistedPrograms(studentId: number): Promise<ApiResponse<{ shortlisted_programs: any[] }>> {
    const apps = await prisma.student_applications.findMany({
      where: { 
        stdid: BigInt(studentId),
        status: false, // InActive scope
      },
      include: {
        university_programs: {
          select: {
            id: true,
            course_name: true,
            level: true,
            duration: true,
            study_mode: true,
            intake: true,
            application_deadline: true,
            university_id: true,
            university: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      status: true,
      message: 'Shortlisted programs fetched successfully.',
      data: { shortlisted_programs: serializeBigInt(apps) },
    };
  }

  /**
   * Change password.
   */
  async changePassword(studentId: number, input: ChangePasswordInput): Promise<ApiResponse> {
    const student = await prisma.leads.findUnique({
      where: { id: BigInt(studentId) },
    });

    if (!student) {
      return { status: false, message: 'Student not found.' };
    }

    const isMatch = await verifyPassword(input.old_password, student.password ?? '');
    if (!isMatch) {
      return { status: false, message: 'The old password is incorrect.' };
    }

    const hashedPassword = await hashPassword(input.new_password);
    await prisma.leads.update({
      where: { id: student.id },
      data: { password: hashedPassword },
    });

    return { status: true, message: 'Password has been changed successfully.' };
  }
}

export const studentProfileService = StudentProfileService.getInstance();
