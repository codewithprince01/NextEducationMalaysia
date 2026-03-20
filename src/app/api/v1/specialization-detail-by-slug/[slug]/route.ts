import { NextRequest } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError } from '@/backend';
import { getSpecializationBySlug } from '@/lib/queries/specializations';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await params;
    const result = await getSpecializationBySlug(slug);
    
    if (!result) {
      return apiError('Specialization not found', 404);
    }

    return apiSuccess(result, 'Specialization details fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch specialization details', 500);
  }
});
