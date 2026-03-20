import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, serviceService } from '@/backend';

/**
 * GET /api/v1/services
 */
async function getHandler(req: NextRequest) {
  try {
    const data = await serviceService.getServices();
    return apiSuccess(data, 'Services fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch services');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
