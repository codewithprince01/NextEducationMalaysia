import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError, serializeBigInt } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get('website') || undefined;

    const universities = await searchApplyService.getUniversities(website);
    if (universities.length === 0) {
      return apiError('No universities found', 404, { data: [] });
    }
    return apiSuccess(serializeBigInt(universities), 'Universities fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
}
