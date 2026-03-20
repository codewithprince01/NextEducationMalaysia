import { NextRequest } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, malaysiaDiscoveryService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
      level: searchParams.get('level') || undefined,
      category: searchParams.get('category') || undefined,
      specialization: searchParams.get('specialization') || undefined,
      study_mode: searchParams.get('study_mode') || undefined,
      intake: searchParams.get('intake') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    });

    return apiSuccess(result.rows.data, 'Courses in Malaysia fetched successfully', 200, {
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
      },
      // Add legacy response format for compatibility
      rows: result.rows,
      courses: {
        data: result.rows.data,
        total: result.rows.total,
        current_page: result.rows.current_page,
        last_page: result.rows.last_page,
      }
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch courses in Malaysia', 500);
  }
});
