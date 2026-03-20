import { NextRequest } from 'next/server';
import { 
  withMiddleware, 
  checkApiKey, 
  apiSuccess, 
  apiError, 
  malaysiaDiscoveryService 
} from '@/backend';

/**
 * GET /api/v1/courses
 * Handles course listing with filters for Malaysia content.
 */
async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // The page fetches using level[], category[], etc.
    // MalaysiaDiscoveryService expects level, category (single strings or handled internally)
    // We'll extract the first value for now as the service seems designed for single values 
    // or we can adjust it if multiple are needed.
    
    const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
      level: searchParams.get('levels[]') || searchParams.get('level') || undefined,
      category: searchParams.get('categories[]') || searchParams.get('category') || undefined,
      specialization: searchParams.get('specializations[]') || searchParams.get('specialization') || undefined,
      study_mode: searchParams.get('study_modes[]') || searchParams.get('study_mode') || undefined,
      intake: searchParams.get('intakes[]') || searchParams.get('intake') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    });

    return apiSuccess(result.rows.data, 'Courses fetched successfully', 200, {
      filters: result.filters,
      current_filters: result.current_filters,
      seo: result.seo,
      nou: result.nou,
      noc: result.noc,
      pagination: {
        total: result.rows.total,
        current_page: result.rows.current_page,
        per_page: result.rows.per_page,
        last_page: result.rows.last_page
      }
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch courses', 500);
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
