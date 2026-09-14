import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError, serializeBigInt } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');
    const level = searchParams.get('level') || undefined;

    const categories = await searchApplyService.getCategories(
      universityId ? Number(universityId) : undefined,
      level
    );

    if (categories.length === 0) {
      return apiError('No categories found', 404, { data: [] });
    }
    return apiSuccess(serializeBigInt(categories), 'Categories fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
}
