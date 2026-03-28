import { NextRequest } from 'next/server';
import {
  withMiddleware, apiSuccess, apiError, partnerService } from '@/backend';

export const GET = withMiddleware()(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || undefined;
    const state = searchParams.get('state') || undefined;

    const cities = await partnerService.getCities(country, state);
    return apiSuccess(cities, 'Success', 200, { status: true });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch cities', 500);
  }
});

