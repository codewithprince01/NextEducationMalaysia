import { prisma } from '@/lib/db';
import { SITE_VAR } from '../utils/constants';
import { notificationService } from './notification.service';
import { sendProgramApplicationEmail } from '../email/send-application-email';

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
      `SELECT course_name, uname, duration, study_mode, intake, tution_fee FROM university_programs WHERE id = ? LIMIT 1`,
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

    const newApp = createdRows[0];
    if (newApp?.id) {
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

        let defaults = (await prisma.$queryRawUnsafe(
          `SELECT docs_name, docs_type, level FROM required_documents WHERE status = 1 OR status = true ORDER BY id ASC`
        )) as Array<{ docs_name: string; docs_type: string; level: string }>;

        if (!defaults || defaults.length === 0) {
          defaults = [
            { docs_name: 'International Passport Copy', docs_type: 'required', level: 'All' },
            { docs_name: 'Grade 12 / High School Certificate & Transcript', docs_type: 'required', level: 'All' },
            { docs_name: 'Passport-Sized Photograph (White Background)', docs_type: 'required', level: 'All' },
            { docs_name: 'Grade 10 / Secondary School Certificate', docs_type: 'required', level: 'All' },
            { docs_name: 'English Language Proficiency Proof', docs_type: 'required', level: 'All' },
            { docs_name: 'Resume / Curriculum Vitae (CV)', docs_type: 'optional', level: 'All' },
            { docs_name: 'Health Declaration Form', docs_type: 'optional', level: 'All' },
          ];
        }

        const seen = new Set<string>();
        for (const d of defaults) {
          const title = String(d.docs_name || '').trim();
          if (!title || seen.has(title.toLowerCase())) continue;
          seen.add(title.toLowerCase());

          const tag = d.docs_type === 'optional' ? 'Optional now, required later' : 'Required';
          const stageTag = d.docs_type === 'optional' ? 'Before visa' : 'Before payment';

          await prisma.$executeRawUnsafe(
            `INSERT INTO application_requirements (app_id, std_id, title, tag, stage_tag, action_type, doc_status) VALUES (?, ?, ?, ?, ?, 'upload', 'Pending')`,
            Number(newApp.id),
            Number(studentId),
            title,
            tag,
            stageTag
          );
        }

        const existingCustom = (await prisma.$queryRawUnsafe(
          `SELECT DISTINCT title, tag, stage_tag, action_type FROM application_requirements WHERE std_id = ? AND app_id != ?`,
          Number(studentId),
          Number(newApp.id)
        )) as Array<{ title: string; tag: string; stage_tag: string; action_type: string }>;

        for (const ec of existingCustom) {
          const t = String(ec.title || '').trim();
          if (!t || seen.has(t.toLowerCase())) continue;
          seen.add(t.toLowerCase());

          await prisma.$executeRawUnsafe(
            `INSERT INTO application_requirements (app_id, std_id, title, tag, stage_tag, action_type, doc_status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            Number(newApp.id),
            Number(studentId),
            t,
            ec.tag || 'Required',
            ec.stage_tag || 'Before payment',
            ec.action_type || 'upload'
          );
        }
      } catch (err) {
        console.error('Failed to auto-assign default requirements on applyProgram:', err);
      }
    }

    // 1. Dispatch in-app notification to Admin and Assigned Counsellor(s) in CRM
    try {
      const studentName = student?.name || 'Student';
      const courseName = program?.course_name || 'Program';
      const uniName = program?.uname || 'University';
      await notificationService.notifyStaff({
        leadId: studentId,
        appId: newApp?.id,
        category: 'application_applied',
        title: `New Application: ${studentName}`,
        subtitle: `${courseName} • ${uniName}`,
        message: `${studentName} has applied for ${courseName} at ${uniName}.`,
        link: `/admin/lead/${Number(studentId)}?tab=applications`,
        actionLabel: 'View Application',
        priority: 'high',
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch staff notification on program application:', notifErr);
    }

    // 2. Dispatch email notification to Admin & Team
    sendProgramApplicationEmail({
      studentId,
      appId: newApp?.id,
      programId: progId,
      courseName: program?.course_name || 'Program',
      universityName: program?.uname || 'Malaysian University',
      studyMode: program?.study_mode || null,
      duration: program?.duration || null,
      intake: program?.intake || null,
      tuitionFee: program?.tution_fee ? `RM ${program.tution_fee}` : null,
    }).catch((emailErr) => {
      console.error('[ApplicationService] Error sending program application email:', emailErr);
    });

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
