import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, serviceService } from '@/backend';

/**
 * GET /api/v1/services/[slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await serviceService.getServiceBySlug(params.slug);
    if (!data) return apiError('Service not found', 404);
    
    return apiSuccess(data, 'Service details fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch service details');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
