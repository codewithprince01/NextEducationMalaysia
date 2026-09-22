import { prisma } from '@/lib/db';

export interface CreateStaffNotificationParams {
  leadId: number | bigint;
  appId?: number | bigint | null;
  category:
    | 'application_applied'
    | 'document_uploaded'
    | 'task_completed'
    | 'activity_logged'
    | 'chat_message';
  title: string;
  subtitle?: string | null;
  message: string;
  link?: string | null;
  actionLabel?: string | null;
  priority?: 'high' | 'medium' | 'normal';
}

/**
 * Enterprise Notification Service for NextEducationMalaysia (Singleton)
 * Integrates directly with the shared `notifications` table in MySQL.
 */
export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async ensureTable(): Promise<void> {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS notifications (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          recipient_type VARCHAR(20) NOT NULL,
          recipient_id BIGINT UNSIGNED NULL,
          lead_id BIGINT UNSIGNED NULL,
          app_id BIGINT UNSIGNED NULL,
          category VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255) NULL,
          message TEXT NOT NULL,
          link VARCHAR(255) NULL,
          action_label VARCHAR(100) NULL,
          priority VARCHAR(20) DEFAULT 'normal',
          is_read BOOLEAN DEFAULT FALSE,
          read_at DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_notif_recipient (recipient_type, recipient_id, is_read),
          INDEX idx_notif_lead (lead_id),
          INDEX idx_notif_app (app_id),
          INDEX idx_notif_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (e) {
      console.warn('Could not ensure notifications table:', e);
    }
  }

  /**
   * Dispatch notification from student activity to Admin and Assigned Counsellor(s).
   */
  async notifyStaff(params: CreateStaffNotificationParams): Promise<void> {
    await this.ensureTable();

    const leadId = Number(params.leadId);
    const recipientIds = new Set<number>();

    try {
      // 1. Get all active admin & staff leadership users in CRM
      const admins = await prisma.$queryRawUnsafe<Array<{ id: number | bigint }>>(
        `SELECT id FROM users WHERE (role = 'admin' OR role = 'super-admin' OR role = 'dev-head') AND status = 1`
      );
      for (const a of admins) {
        recipientIds.add(Number(a.id));
      }

      // 2. Get counsellor(s) assigned to this lead
      const assigned = await prisma.$queryRawUnsafe<Array<{ clr_id: number | bigint }>>(
        `SELECT clr_id FROM asigned_leads WHERE std_id = ?`,
        leadId
      );
      for (const asg of assigned) {
        if (asg.clr_id) {
          recipientIds.add(Number(asg.clr_id));
        }
      }

      // 3. Insert notification row for each eligible staff member (Admin & assigned counsellor ONLY)
      for (const staffId of recipientIds) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO notifications 
            (recipient_type, recipient_id, lead_id, app_id, category, title, subtitle, message, link, action_label, priority, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
          'staff',
          staffId,
          leadId,
          params.appId ? Number(params.appId) : null,
          params.category,
          params.title,
          params.subtitle ?? null,
          params.message,
          params.link ?? null,
          params.actionLabel ?? null,
          params.priority ?? 'normal'
        );
      }
    } catch (err) {
      console.error('Failed to notify staff from student portal:', err);
    }
  }

  /**
   * Fetch in-app notifications for a logged in student.
   */
  async getStudentNotifications(studentId: number | bigint, limit: number = 30) {
    await this.ensureTable();
    const stdId = Number(studentId);

    const [rows, countRows] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(
        `SELECT id, recipient_type, recipient_id, lead_id, app_id, category, title, subtitle, message, link, action_label, priority, is_read, read_at, created_at
         FROM notifications
         WHERE recipient_type = 'student' AND (recipient_id = ? OR lead_id = ?)
         ORDER BY id DESC
         LIMIT ?`,
        stdId,
        stdId,
        limit
      ),
      prisma.$queryRawUnsafe<Array<{ cnt: bigint | number }>>(
        `SELECT COUNT(*) as cnt 
         FROM notifications 
         WHERE recipient_type = 'student' AND (recipient_id = ? OR lead_id = ?) AND is_read = 0`,
        stdId,
        stdId
      ),
    ]);

    const unreadCount = Number(countRows[0]?.cnt || 0);

    const notifications = rows.map((r) => {
      let link = r.link;
      if (r.app_id && (r.category === 'stage_changed' || r.category === 'application_applied' || link?.includes('applied-colleges') || link?.includes('my-applications'))) {
        link = `/student/applications/${Number(r.app_id)}`;
      }

      return {
        id: String(r.id),
        recipient_id: r.recipient_id ? Number(r.recipient_id) : null,
        lead_id: r.lead_id ? Number(r.lead_id) : null,
        app_id: r.app_id ? Number(r.app_id) : null,
        category: r.category,
        title: r.title,
        subtitle: r.subtitle,
        message: r.message,
        link,
        actionLabel: r.action_label,
        priority: r.priority,
        read: Boolean(r.is_read),
        timestamp: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Mark a notification as read for a student.
   */
  async markStudentNotificationAsRead(id: number | bigint, studentId: number | bigint) {
    await this.ensureTable();
    const notifId = Number(id);
    const stdId = Number(studentId);

    await prisma.$executeRawUnsafe(
      `UPDATE notifications 
       SET is_read = 1, read_at = NOW() 
       WHERE id = ? AND recipient_type = 'student' AND (recipient_id = ? OR lead_id = ?)`,
      notifId,
      stdId,
      stdId
    );

    return { success: true };
  }

  /**
   * Mark all notifications as read for a student.
   */
  async markAllStudentNotificationsAsRead(studentId: number | bigint) {
    await this.ensureTable();
    const stdId = Number(studentId);

    await prisma.$executeRawUnsafe(
      `UPDATE notifications 
       SET is_read = 1, read_at = NOW() 
       WHERE recipient_type = 'student' AND (recipient_id = ? OR lead_id = ?) AND is_read = 0`,
      stdId,
      stdId
    );

    return { success: true };
  }
}

export const notificationService = NotificationService.getInstance();
