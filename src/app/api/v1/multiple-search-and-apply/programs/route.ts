import { NextRequest, NextResponse } from 'next/server';
import { multipleSearchApplyService, apiSuccess, apiError, serializeBigInt, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      website: searchParams.get('website'),
      university_id: searchParams.get('university_id'),
      level: searchParams.get('level'),
      course_category_id: searchParams.get('course_category_id'),
      specialization_id: searchParams.get('specialization_id'),
    };

    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    const result = await multipleSearchApplyService.getPrograms(filters, page, perPage);

    if (result.items.length === 0) {
      return apiError('No programs found', 404);
    }

    return NextResponse.json({
      status: true,
      message: 'Programs fetched successfully',
      pagination: result.pagination,
      data: serializeBigInt(result.items),
    });
  } catch (error: any) {
    return apiError(error.message);
  }
});
