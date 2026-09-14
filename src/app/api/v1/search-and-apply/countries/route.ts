import { NextRequest } from 'next/server';
import { searchApplyService, apiSuccess, apiError } from '@/backend';

export async function GET(req: NextRequest) {
  try {
    const countries = await searchApplyService.getCountries();
    if (countries.length === 0) {
      return apiError('No countries found', 404, { data: [] });
    }
    return apiSuccess(countries, 'Countries fetched successfully');
  } catch (error: any) {
    return apiError(error.message);
  }
}
