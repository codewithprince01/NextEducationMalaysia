import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess } from '@/backend';
import { prisma } from '@/lib/db-fresh';
import { serializeBigInt } from '@/lib/utils';

/**
 * GET /api/v1/blog/categories
 * Returns all active blog categories
 */
async function getHandler(req: NextRequest) {
  const categories = await prisma.blogCategory.findMany({
    where: { status: true as any },
    select: {
      id: true,
      category_name: true,
      category_slug: true,
    },
    orderBy: { category_name: 'asc' }
  });

  return apiSuccess(serializeBigInt(categories), 'Categories fetched successfully');
}

export const GET = withMiddleware(checkApiKey)(getHandler);
