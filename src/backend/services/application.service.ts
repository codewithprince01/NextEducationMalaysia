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

    // Fetch program info to populate required fields
    const program = await prisma.universityProgram.findUnique({
      where: { id: progId },
      select: { course_name: true, uname: true }
    });

    // Check if already applied
    const existing = await prisma.student_applications.findFirst({
      where: { stdid: studentId, prog_id: progId }
    });
    if (existing) throw new Error('ALREADY_APPLIED');

    // Fetch student name for the required std_name field
    const student = await prisma.leads.findUnique({
      where: { id: studentId },
      select: { name: true }
    });

    return await prisma.student_applications.create({
      data: {
        stdid: studentId,
        prog_id: progId,
        program: program?.course_name?.substring(0, 50) || 'N/A',
        university: program?.uname?.substring(0, 50) ?? null,
        status: STATUS_APPLIED,
        std_name: student?.name || 'Student',
        payment_date: 'N/A',
        recruitment_by: 'Portal',
        sent_status: 'not_sent',
        website: SITE_VAR
      }
    });
  }

  /**
   * Shortlist a program. Status false (Shortlisted).
   */
  async shortlistProgram(studentId: bigint, programId: string | number | bigint) {
    const progId = BigInt(programId);

    // Fetch program info
    const program = await prisma.universityProgram.findUnique({
      where: { id: progId },
      select: { course_name: true, uname: true }
    });

    // Check if already exists
    const existing = await prisma.student_applications.findFirst({
      where: { stdid: studentId, prog_id: progId }
    });
    if (existing) throw new Error('ALREADY_SHORTLISTED_OR_APPLIED');

    const student = await prisma.leads.findUnique({
      where: { id: studentId },
      select: { name: true }
    });

    return await prisma.student_applications.create({
      data: {
        stdid: studentId,
        prog_id: progId,
        program: program?.course_name?.substring(0, 50) || 'N/A',
        university: program?.uname?.substring(0, 50) ?? null,
        status: STATUS_SHORTLISTED,
        std_name: student?.name || 'Student',
        payment_date: 'N/A',
        recruitment_by: 'Portal',
        sent_status: 'not_sent',
        website: SITE_VAR
      }
    });
  }

  /**
   * Delete an application/shortlist record.
   */
  async deleteApplication(applicationId: string | number | bigint) {
    const id = BigInt(applicationId);

    const application = await prisma.student_applications.findUnique({ where: { id } });
    if (!application) throw new Error('NOT_FOUND');

    await prisma.student_applications.delete({ where: { id } });
    return true;
  }
}

export const applicationService = ApplicationService.getInstance();
