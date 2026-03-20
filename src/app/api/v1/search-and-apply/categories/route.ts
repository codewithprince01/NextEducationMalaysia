import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError, serializeBigInt, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');
    const level = searchParams.get('level') || undefined;

    if (!universityId) {
      return apiError('university_id is required', 400);
    }

    const categories = await searchApplyService.getCategories(BigInt(universityId), level);
    if (categories.length === 0) {
      return apiError('No categories found', 404);
    }
    return apiSuccess(serializeBigInt(categories), 'Categories fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
});
