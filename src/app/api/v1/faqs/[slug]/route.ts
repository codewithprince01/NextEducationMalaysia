import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, faqService, NotFoundError } from '@/backend';

/**
 * GET /api/v1/faqs/[slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const data = await faqService.getFaqCategoryDetail(params.slug);
  if (!data) throw new NotFoundError('FAQ category not found');
  
  return apiSuccess(data, 'FAQ category details fetched successfully');
}

export const GET = withMiddleware(checkApiKey)(getHandler);
