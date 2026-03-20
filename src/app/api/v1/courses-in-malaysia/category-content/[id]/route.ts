import { NextRequest } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, malaysiaDiscoveryService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { searchParams } = new URL(req.url);
    const nou = searchParams.get('nou') || '0';
    const noc = searchParams.get('noc') || '0';

    const result = await malaysiaDiscoveryService.getContentDescription('category', params.id, { nou, noc });
    return apiSuccess(result, 'Category content fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch category content', 500);
  }
});
