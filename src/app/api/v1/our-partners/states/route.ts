import { NextRequest } from 'next/server';
import {
  withMiddleware, apiSuccess, apiError, partnerService } from '@/backend';

export const GET = withMiddleware()(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || undefined;

    const states = await partnerService.getStates(country);
    return apiSuccess(states, 'Success', 200, { status: true });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch states', 500);
  }
});

