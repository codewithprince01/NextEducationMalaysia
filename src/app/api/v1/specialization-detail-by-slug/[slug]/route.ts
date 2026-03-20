import { NextRequest } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, discoveryService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const slug = params.slug;
    const result = await discoveryService.getSpecializationDetail(slug, 'slug');
    
    if (!result) {
      return apiError('Specialization not found', 404);
    }

    return apiSuccess(result.data, 'Specialization details fetched successfully', 200, { seo: result.seo });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch specialization details', 500);
  }
});
