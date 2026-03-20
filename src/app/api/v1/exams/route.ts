import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, examService } from '@/backend';

/**
 * GET /api/v1/exams
 */
async function getHandler(req: NextRequest) {
  try {
    const data = await examService.getExams();
    return apiSuccess(data, 'Exams fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch exams');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
