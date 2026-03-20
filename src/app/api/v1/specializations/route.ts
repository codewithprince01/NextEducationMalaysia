import { NextRequest } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, discoveryService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const course_category_id = searchParams.get('course_category_id') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const orderBy = searchParams.get('orderBy') || 'name';
    const orderIn = (searchParams.get('orderIn') as 'asc' | 'desc') || 'asc';

    const result = await discoveryService.getSpecializations({
      search,
      course_category_id,
      limit,
      orderBy,
      orderIn
    });

    return apiSuccess(result.data, 'Specializations fetched successfully', 200, { seo: result.seo });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch specializations', 500);
  }
});
