import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');

    if (!universityId) {
      return apiError('university_id is required', 400);
    }

    const levels = await searchApplyService.getLevels(BigInt(universityId));
    if (levels.length === 0) {
      return apiError('No levels found', 404);
    }
    return apiSuccess(levels, 'Levels fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
});
