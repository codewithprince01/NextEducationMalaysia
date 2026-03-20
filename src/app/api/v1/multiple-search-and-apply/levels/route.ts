import { NextRequest } from 'next/server';
import { multipleSearchApplyService, apiSuccess, apiError, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get('website');
    const universityIds = searchParams.get('university_id');

    if (!website) {
      return apiError('website is required', 422);
    }

    const levels = await multipleSearchApplyService.getLevels(website, universityIds);
    if (levels.length === 0) {
      return apiError('No levels found', 404);
    }
    return apiSuccess(levels, 'Levels fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
});
