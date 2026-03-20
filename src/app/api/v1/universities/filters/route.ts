import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, universityService } from '@/backend';

/**
 * GET /api/v1/universities/filters
 */
async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeSlug = searchParams.get('type') || undefined;
    
    // We can reuse the same service method but we only need the filters
    const result = await universityService.getUniversitiesInMalaysia({ 
      institute_type: typeSlug,
      limit: 1 
    });
    
    return apiSuccess(result.filters, 'Filters fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch filters');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
