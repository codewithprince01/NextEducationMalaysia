import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, universityService } from '@/backend';

/**
 * GET /api/v1/universities/universities-in-malaysia
 */
async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const params = {
    search: searchParams.get('search') || undefined,
    institute_type: searchParams.get('institute_type') || undefined,
    type_slug: searchParams.get('type_slug') || undefined,
    state: searchParams.get('state') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('per_page') || searchParams.get('limit_per_page') || '21'),
  };

  const data = await universityService.getUniversitiesInMalaysia(params);
  return apiSuccess(data, 'University list fetched successfully');
}

export const GET = withMiddleware(checkApiKey)(getHandler);
