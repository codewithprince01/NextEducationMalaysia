import { NextRequest } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, discoveryService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const levelId = params.id;
    const result = await discoveryService.getSpecializationLevelContents(levelId);
    return apiSuccess(result.data, 'Specialization level contents fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch specialization level contents', 500);
  }
});
