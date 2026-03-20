import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

export const getAllBlogSlugs = unstable_cache(
  () =>
    prisma.blog.findMany({
      where: { status: 1 as any },
      select: { id: true, slug: true, category: { select: { category_slug: true } } },
    }).then((rows: any[]) =>
      rows
        .filter(r => r.slug && r.category?.category_slug)
        .map(r => ({
          category: r.category!.category_slug!,
          slugWithId: `${r.slug}-${Number(r.id)}`,
        })),
    ),
  ['blog-slugs'],
  { revalidate: 21600 },
)

export const getBlogBySlugAndId = unstable_cache(
  (slug: string, id: number) =>
    prisma.blog.findFirst({
      where: { slug, id, status: 1 as any },
      select: {
        id: true,
        headline: true,
        slug: true,
        description: true,
        thumbnail_path: true,
        meta_title: true,
        meta_description: true,
        meta_keyword: true,
        og_image_path: true,
        created_at: true,
        updated_at: true,
        category: {
          select: {
            id: true,
            category_name: true,
            category_slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }).then(serializeBigInt),
  ['blog-detail'],
  { revalidate: 21600, tags: ['blog'] },
)

export const getBlogsByCategory = unstable_cache(
  (categorySlug: string, page = 1, perPage = 12) =>
    prisma.blog.findMany({
      where: {
        status: 1 as any,
        category: { category_slug: categorySlug },
      },
      select: {
        id: true,
        headline: true,
        slug: true,
        description: true,
        thumbnail_path: true,
        created_at: true,
        category: { select: { category_slug: true, category_name: true } },
        author: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }).then(serializeBigInt) as any,
  ['blogs-by-category'],
  { revalidate: 21600 },
)

export const getRecentBlogs = unstable_cache(
  (limit = 6) =>
    prisma.blog.findMany({
      where: { status: 1 as any },
      select: {
        id: true,
        headline: true,
        slug: true,
        description: true,
        thumbnail_path: true,
        created_at: true,
        category: { select: { category_slug: true, category_name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    }).then(serializeBigInt) as any,
  ['recent-blogs'],
  { revalidate: 21600 },
)

export const getBlogCategories = unstable_cache(
  () =>
    prisma.blogCategory.findMany({
      where: { status: 1 as any },
      select: {
        id: true,
        category_name: true,
        category_slug: true,
        _count: { select: { blogs: { where: { status: 1 as any } } } },
      },
    }).then(serializeBigInt),
  ['blog-categories'],
  { revalidate: 21600 },
)
