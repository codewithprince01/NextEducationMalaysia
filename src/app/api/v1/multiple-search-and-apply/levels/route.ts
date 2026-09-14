import { NextRequest, NextResponse } from 'next/server';
import { multipleSearchApplyService, apiSuccess, apiError } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get('website');
    const universityIds = searchParams.get('university_id');

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

    const levels = await multipleSearchApplyService.getLevels(website, universityIds);
    if (levels.length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: 'No levels found',
          data: [],
        },
        { status: 404 }
      );
    }
    return apiSuccess(levels, 'Levels fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
}
