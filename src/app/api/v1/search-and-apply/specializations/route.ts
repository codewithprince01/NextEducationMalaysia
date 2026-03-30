import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError, serializeBigInt, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');
    const level = searchParams.get('level') || undefined;
    const categoryId = searchParams.get('course_category_id');

    if (!universityId) {
      return apiError('university_id is required', 400);
    }

    const specializations = await searchApplyService.getSpecializations(
      Number(universityId),
      level,
      categoryId ? Number(categoryId) : undefined
    );

    if (specializations.length === 0) {
      return apiError('No specializations found', 404);
    }
    return apiSuccess(serializeBigInt(specializations), 'Specializations fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
});

