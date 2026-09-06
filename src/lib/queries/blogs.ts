import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'
import { getContentVersion } from './contentVersion'

// ── Slug List ─────────────────────────────────────────────────────────────────
async function fetchAllBlogSlugs() {
  const rows = await prisma.blog.findMany({
    where: { status: 1 as any },
    select: { id: true, slug: true, category: { select: { category_slug: true } } },
  })
  return rows
    .filter((r: any) => r.slug && r.category?.category_slug)
    .map((r: any) => ({
      category: r.category!.category_slug!,
      slugWithId: `${r.slug}-${Number(r.id)}`,
    }))
}

const cachedBlogSlugs = unstable_cache(
  async (_version: string) => fetchAllBlogSlugs(),
  ['blog-slugs'],
  { revalidate: 86400, tags: ['blog'] },
)

export async function getAllBlogSlugs() {
  if (process.env.NODE_ENV === 'development') {
    return fetchAllBlogSlugs()
  }
  return cachedBlogSlugs(await getContentVersion('blog'))
}

// ── Detail By Slug and ID ─────────────────────────────────────────────────────
async function fetchBlogBySlugAndId(slug: string, id: number) {
  const row = await prisma.blog.findFirst({
    where: {
      id: Number(id),
      status: 1 as any,
    },
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
  })
  return serializeBigInt(row)
}

const cachedBlogBySlugAndId = unstable_cache(
  async (_version: string, slug: string, id: number) => fetchBlogBySlugAndId(slug, id),
  ['blog-detail-by-slug-id'],
  { revalidate: 86400, tags: ['blog'] },
)

export async function getBlogBySlugAndId(slug: string, id: number) {
  if (process.env.NODE_ENV === 'development') {
    return fetchBlogBySlugAndId(slug, id)
  }
  return cachedBlogBySlugAndId(await getContentVersion('blog'), slug, id)
}

// ── Blogs by Category ─────────────────────────────────────────────────────────
async function fetchBlogsByCategory(categorySlug: string, page = 1, perPage = 12) {
  const rows = await prisma.blog.findMany({
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
  })
  return serializeBigInt(rows)
}

const cachedBlogsByCategory = unstable_cache(
  async (_version: string, categorySlug: string, page: number, perPage: number) =>
    fetchBlogsByCategory(categorySlug, page, perPage),
  ['blogs-by-category'],
  { revalidate: 86400, tags: ['blog'] },
)

export async function getBlogsByCategory(categorySlug: string, page = 1, perPage = 12) {
  if (process.env.NODE_ENV === 'development') {
    return fetchBlogsByCategory(categorySlug, page, perPage)
  }
  return cachedBlogsByCategory(await getContentVersion('blog'), categorySlug, page, perPage)
}

// ── Recent Blogs ──────────────────────────────────────────────────────────────
async function fetchRecentBlogs(limit = 6) {
  const rows = await prisma.blog.findMany({
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
  })
  return serializeBigInt(rows)
}

const cachedRecentBlogs = unstable_cache(
  async (_version: string, limit: number) => fetchRecentBlogs(limit),
  ['recent-blogs'],
  { revalidate: 86400, tags: ['blog'] },
)

export async function getRecentBlogs(limit = 6) {
  if (process.env.NODE_ENV === 'development') {
    return fetchRecentBlogs(limit)
  }
  return cachedRecentBlogs(await getContentVersion('blog'), limit)
}

// ── Blog Categories ───────────────────────────────────────────────────────────
async function fetchBlogCategories() {
  const rows = await prisma.blogCategory.findMany({
    where: { status: 1 as any },
    select: {
      id: true,
      category_name: true,
      category_slug: true,
      _count: { select: { blogs: { where: { status: 1 as any } } } },
    },
  })
  return serializeBigInt(rows)
}

const cachedBlogCategories = unstable_cache(
  async (_version: string) => fetchBlogCategories(),
  ['blog-categories'],
  { revalidate: 86400, tags: ['blog'] },
)

export async function getBlogCategories() {
  if (process.env.NODE_ENV === 'development') {
    return fetchBlogCategories()
  }
  return cachedBlogCategories(await getContentVersion('blog'))
}
