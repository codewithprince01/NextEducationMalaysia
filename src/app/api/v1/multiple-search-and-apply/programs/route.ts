import { NextRequest, NextResponse } from 'next/server';
import { multipleSearchApplyService, apiError, serializeBigInt } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      website: searchParams.get('website') || searchParams.get('country'),
      university_id: searchParams.get('university_id'),
      level: searchParams.get('level'),
      course_category_id: searchParams.get('course_category_id'),
      specialization_id: searchParams.get('specialization_id'),
    };

    const page = parseInt(searchParams.get('page') || searchParams.get('current_page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '10', 10);

    const result = await multipleSearchApplyService.getPrograms(filters, page, perPage);

    if (result.items.length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: 'No programs found',
          data: [],
        },
        { status: 404 }
      );
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
}
