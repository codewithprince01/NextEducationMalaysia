import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError, serializeBigInt } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');
    const level = searchParams.get('level') || undefined;
    const categoryId = searchParams.get('course_category_id');

    const specializations = await searchApplyService.getSpecializations(
      universityId ? Number(universityId) : undefined,
      level,
      categoryId ? Number(categoryId) : undefined
    );

    if (specializations.length === 0) {
      return apiError('No specializations found', 404, { data: [] });
    }
    return apiSuccess(serializeBigInt(specializations), 'Specializations fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
}
