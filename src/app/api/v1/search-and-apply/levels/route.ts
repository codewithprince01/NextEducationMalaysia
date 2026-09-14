import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');
    const website = searchParams.get('website') || undefined;

    const levels = await searchApplyService.getLevels(
      universityId ? Number(universityId) : undefined,
      website
    );

    if (levels.length === 0) {
      return apiError('No levels found', 404, { data: [] });
    }
    return apiSuccess(levels, 'Levels fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
}
