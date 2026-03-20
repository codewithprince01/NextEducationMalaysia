import { NextRequest } from 'next/server';
import {
  withMiddleware, checkApiKey, apiSuccess, apiError, partnerService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || undefined;
    const state = searchParams.get('state') || undefined;
    const city = searchParams.get('city') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await partnerService.getPartners({ country, state, city, search });

    return apiSuccess(result.data, 'Success', 200, { status: true, count: result.count });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch partners', 500);
  }
});
