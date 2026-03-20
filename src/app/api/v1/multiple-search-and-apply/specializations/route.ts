import { NextRequest } from 'next/server';
import { multipleSearchApplyService, apiSuccess, apiError, serializeBigInt, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get('website');
    const universityIds = searchParams.get('university_id');
    const levels = searchParams.get('level');
    const categoryIds = searchParams.get('course_category_id');

    if (!website) {
      return apiError('website is required', 422);
    }

    const specializations = await multipleSearchApplyService.getSpecializations(
      website,
      universityIds,
      levels,
      categoryIds
    );

    if (specializations.length === 0) {
      return apiError('No specializations found', 404);
    }
    return apiSuccess(serializeBigInt(specializations), 'Specializations fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
});
