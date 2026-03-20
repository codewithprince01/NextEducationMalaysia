import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, faqService } from '@/backend';

/**
 * GET /api/v1/faqs
 */
async function getHandler() {
  const data = await faqService.getFaqCategories();
  return apiSuccess(data, 'FAQ categories fetched successfully');
}

export const GET = withMiddleware(checkApiKey)(getHandler);
