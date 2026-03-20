import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const countries = await searchApplyService.getCountries();
    if (countries.length === 0) {
      return apiError('No countries found', 404);
    }
    return apiSuccess(countries, 'Countries fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
});
