import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  checkApiKey,
  requireAuth,
  apiSuccess,
  apiError,
  notificationService,
} from '@/backend';

/**
 * GET /api/v1/student/notifications
 * Fetch notifications for authenticated student
 */
export const GET = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const studentId = authResult.student.sub;
    const result = await notificationService.getStudentNotifications(studentId);
    return apiSuccess(result, 'Notifications fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch notifications', 500);
  }
});

/**
 * PATCH /api/v1/student/notifications
 * Mark a specific notification as read: { id: number | string }
 */
export const PATCH = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const studentId = authResult.student.sub;
    const body = await request.json().catch(() => ({}));
    if (!body.id) {
      return apiError('Notification ID is required', 400);
    }

    await notificationService.markStudentNotificationAsRead(body.id, studentId);
    return apiSuccess({ success: true }, 'Notification marked as read');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update notification', 500);
  }
});

/**
 * POST /api/v1/student/notifications
 * Mark all notifications as read
 */
export const POST = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const studentId = authResult.student.sub;
    await notificationService.markAllStudentNotificationsAsRead(studentId);
    return apiSuccess({ success: true }, 'All notifications marked as read');
  } catch (error: any) {
    return apiError(error.message || 'Failed to mark notifications as read', 500);
  }
});
