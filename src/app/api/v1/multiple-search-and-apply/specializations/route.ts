import { NextRequest, NextResponse } from 'next/server';
import { multipleSearchApplyService, apiSuccess, apiError, serializeBigInt } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get('website');
    const universityIds = searchParams.get('university_id');
    const levels = searchParams.get('level');
    const categoryIds = searchParams.get('course_category_id');

    if (!website) {
      return NextResponse.json(
        {
          status: false,
          message: 'website is required',
          data: [],
        },
        { status: 422 }
      );
    }

    const specializations = await multipleSearchApplyService.getSpecializations(
      website,
      universityIds,
      levels,
      categoryIds
    );

    if (specializations.length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: 'No specializations found',
          data: [],
        },
        { status: 404 }
      );
    }
    return apiSuccess(serializeBigInt(specializations), 'Specializations fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
}
