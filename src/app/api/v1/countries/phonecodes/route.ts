import { NextRequest } from 'next/server';
import {
  withMiddleware, apiSuccess, apiError, countryService, serializeBigInt } from '@/backend';

export const GET = withMiddleware()(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const orderBy = searchParams.get('orderBy') || undefined;
    const orderIn = (searchParams.get('orderIn') as 'asc' | 'desc') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const countries = await countryService.getPhoneCodes({ search, orderBy, orderIn, limit });
    return apiSuccess(serializeBigInt(countries));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch phone codes', 500);
  }
});
