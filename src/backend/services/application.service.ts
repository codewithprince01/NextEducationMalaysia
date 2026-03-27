import { prisma } from '@/lib/db';
import { SITE_VAR } from '../utils/constants';

// Status: false = Shortlisted, true = Applied (mirrors legacy status 0/1)
const STATUS_SHORTLISTED = false;
const STATUS_APPLIED = true;

/**
 * Enterprise Application Service (Singleton)
 */
export class ApplicationService {
  private static instance: ApplicationService;

  private constructor() {}

  static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  /**
   * Apply for a program. Status true (Applied).
   */
  async applyProgram(studentId: bigint, programId: string | number | bigint) {
    const progId = BigInt(programId);

    const [program] = await prisma.$queryRawUnsafe(
      `SELECT course_name, uname FROM university_programs WHERE id = ? LIMIT 1`,
      Number(progId)
    ) as any[];

    if (!program) {
      throw new Error('PROGRAM_NOT_FOUND');
    }

    const existingRows = await prisma.$queryRawUnsafe(
      `SELECT id FROM student_applications WHERE stdid = ? AND prog_id = ? LIMIT 1`,
      Number(studentId),
      Number(progId)
    ) as any[];
    if (existingRows.length > 0) throw new Error('ALREADY_APPLIED');

    const [student] = await prisma.$queryRawUnsafe(
      `SELECT name FROM leads WHERE id = ? LIMIT 1`,
      Number(studentId)
    ) as any[];

    await prisma.$executeRawUnsafe(
      `INSERT INTO student_applications
        (stdid, prog_id, program, university, status, app_status, std_name, payment_date, recruitment_by, stage, sent_status, website)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Number(studentId),
      Number(progId),
      String(program?.course_name || 'N/A').substring(0, 50),
      program?.uname ? String(program.uname).substring(0, 50) : null,
      STATUS_APPLIED ? 1 : 0,
      'Not-Paid',
      String(student?.name || 'Student'),
      'N/A',
      'Portal',
      'Pre-Payment',
      'not-sent',
      SITE_VAR
    );

    const createdRows = await prisma.$queryRawUnsafe(
      `SELECT * FROM student_applications WHERE stdid = ? AND prog_id = ? ORDER BY id DESC LIMIT 1`,
      Number(studentId),
      Number(progId)
    ) as any[];
    return createdRows[0] || null;
  }

  /**
   * Shortlist a program. Status false (Shortlisted).
   */
  async shortlistProgram(studentId: bigint, programId: string | number | bigint) {
    const progId = BigInt(programId);

    const [program] = await prisma.$queryRawUnsafe(
      `SELECT course_name, uname FROM university_programs WHERE id = ? LIMIT 1`,
      Number(progId)
    ) as any[];
    if (!program) {
      throw new Error('PROGRAM_NOT_FOUND');
    }

    const existingRows = await prisma.$queryRawUnsafe(
      `SELECT id FROM student_applications WHERE stdid = ? AND prog_id = ? LIMIT 1`,
      Number(studentId),
      Number(progId)
    ) as any[];
    if (existingRows.length > 0) throw new Error('ALREADY_SHORTLISTED_OR_APPLIED');

    const [student] = await prisma.$queryRawUnsafe(
      `SELECT name FROM leads WHERE id = ? LIMIT 1`,
      Number(studentId)
    ) as any[];

    await prisma.$executeRawUnsafe(
      `INSERT INTO student_applications
        (stdid, prog_id, program, university, status, app_status, std_name, payment_date, recruitment_by, stage, sent_status, website)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Number(studentId),
      Number(progId),
      String(program?.course_name || 'N/A').substring(0, 50),
      program?.uname ? String(program.uname).substring(0, 50) : null,
      STATUS_SHORTLISTED ? 1 : 0,
      'Not-Paid',
      String(student?.name || 'Student'),
      'N/A',
      'Portal',
      'Pre-Payment',
      'not-sent',
      SITE_VAR
    );

    const createdRows = await prisma.$queryRawUnsafe(
      `SELECT * FROM student_applications WHERE stdid = ? AND prog_id = ? ORDER BY id DESC LIMIT 1`,
      Number(studentId),
      Number(progId)
    ) as any[];
    return createdRows[0] || null;
  }

  /**
   * Delete an application/shortlist record.
   */
  async deleteApplication(applicationId: string | number | bigint) {
    const id = BigInt(applicationId);

    const existingRows = await prisma.$queryRawUnsafe(
      `SELECT id FROM student_applications WHERE id = ? LIMIT 1`,
      Number(id)
    ) as any[];
    if (existingRows.length === 0) throw new Error('NOT_FOUND');

    await prisma.$executeRawUnsafe(
      `DELETE FROM student_applications WHERE id = ?`,
      Number(id)
    );
    return true;
  }
}

export const applicationService = ApplicationService.getInstance();
