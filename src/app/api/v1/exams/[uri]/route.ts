import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, examService } from '@/backend';

/**
 * GET /api/v1/exams/[uri]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { uri: string } }
) {
  try {
    const data = await examService.getExamDetail(params.uri);
    if (!data) return apiError('Exam not found', 404);
    
    return apiSuccess(data, 'Exam details fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch exam details');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
