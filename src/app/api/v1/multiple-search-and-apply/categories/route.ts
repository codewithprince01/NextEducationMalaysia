import { NextRequest } from 'next/server';
import { multipleSearchApplyService, apiSuccess, apiError, serializeBigInt, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get('website');
    const universityIds = searchParams.get('university_id');
    const levels = searchParams.get('level');

    if (!website) {
      return apiError('website is required', 422);
    }

    const categories = await multipleSearchApplyService.getCategories(website, universityIds, levels);
    if (categories.length === 0) {
      return apiError('No categories found', 404);
    }
    return apiSuccess(serializeBigInt(categories), 'Categories fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
});
