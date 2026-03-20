import { NextRequest } from 'next/server';
import {
  withMiddleware, checkApiKey, apiSuccess, apiError, malaysiaStatsService, serializeBigInt } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');

    let yearsFilter: number[] | undefined;

    if (yearParam && yearParam.trim()) {
      const parsed = yearParam
        .split(',')
        .map(y => parseInt(y.trim()))
        .filter(y => !isNaN(y) && y > 1000);

      if (parsed.length === 0) {
        return apiError('Invalid year format. Use ?year=2025 or ?year=2025,2024', 422);
      }

      yearsFilter = parsed;
    }

    const data = await malaysiaStatsService.getStats(yearsFilter);
    return apiSuccess(serializeBigInt(data));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch Malaysia stats', 500);
  }
});
