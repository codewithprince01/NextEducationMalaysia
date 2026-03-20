import { prisma } from '@/lib/db-fresh';
import { seoService } from './seo.service';
import { logger } from '../utils/logger';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Blog Service (Singleton)
 */
export class BlogService {
  private static instance: BlogService;

  private constructor() {}

  static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  /**
   * Fetches paginated blogs exactly like Laravel BlogApi@index
   */
  async getBlogs(page: number = 1, pageSize: number = 12) {
    const skip = (page - 1) * pageSize;

    try {
      const [blogs, total, seo] = await Promise.all([
        prisma.blog.findMany({
          where: { status: 1 },
          include: {
            category: {
              select: {
                id: true,
                category_name: true,
                category_slug: true,
              },
            },
          },
          orderBy: { id: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.blog.count({ where: { status: 1 } }),
        seoService.getStaticPageSeo('blog', {
          currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
          currentyear: new Date().getFullYear().toString(),
          site: process.env.SITE_URL || '',
        }),
      ]);

      return {
        data: serializeBigInt(blogs),
        pagination: {
          total,
          current_page: page,
          per_page: pageSize,
          last_page: Math.ceil(total / pageSize),
        },
        seo,
      };
    } catch (error) {
      logger.error('Error fetching blogs', error);
      throw error;
    }
  }

  /**
   * Fetches blogs by category exactly like Laravel BlogApi@blogByCategory
   */
  async getBlogsByCategory(categorySlug: string, page: number = 1, pageSize: number = 12) {
    const category = await prisma.blogCategory.findFirst({
      where: { category_slug: categorySlug, status: 1 },
    });

    if (!category) return null;

    const skip = (page - 1) * pageSize;

    const [blogs, total, dynamicSeo] = await Promise.all([
      prisma.blog.findMany({
        where: { category_id: category.id, status: 1 },
        include: {
          category: {
            select: {
              id: true,
              category_name: true,
              category_slug: true,
            },
          },
        },
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.blog.count({ where: { category_id: category.id, status: 1 } }),
      seoService.getStaticPageSeo('blog-by-category', {
        title: category.category_name || '',
        currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
        currentyear: new Date().getFullYear().toString(),
        site: process.env.SITE_URL || '',
      }),
    ]);

    return {
      category: serializeBigInt(category),
      data: serializeBigInt(blogs),
      pagination: {
        total,
        current_page: page,
        per_page: pageSize,
        last_page: Math.ceil(total / pageSize),
      },
      seo: {
        meta_title: category.meta_title || dynamicSeo.meta_title,
        meta_keyword: category.meta_keyword || dynamicSeo.meta_keyword,
        meta_description: category.meta_description || dynamicSeo.meta_description,
        og_image_path: category.og_image_path || dynamicSeo.og_image_path,
        title: category.category_name
      },
    };
  }

  /**
   * Fetches blog details exactly like Laravel BlogApi@detail
   */
  async getBlogDetail(categorySlug: string, slugWithId: string) {
    const category = await prisma.blogCategory.findFirst({
      where: { category_slug: categorySlug },
    });

    if (!category) return null;

    const idMatch = slugWithId.match(/\d+$/);
    const blogId = idMatch ? BigInt(idMatch[0]) : null;
    const slug = slugWithId.replace(/-\d+$/, '');

    if (!blogId) return null;

    const blog = await prisma.blog.findFirst({
      where: {
        category_id: category.id,
        slug: slug,
        id: blogId,
        status: 1,
      },
      include: {
        author: true,
        contents: {
          where: { parent_id: null },
          include: {
            other_blog_contents: {
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!blog) return null;

    const [relatedBlogs, categories, specializations, dynamicSeo] = await Promise.all([
      prisma.blog.findMany({
        where: { id: { not: blog.id }, status: 1 },
        select: { id: true, headline: true, thumbnail_path: true, created_at: true },
        orderBy: { id: 'desc' },
        take: 12,
      }),
      prisma.blogCategory.findMany({
        where: { status: 1 },
        select: { id: true, category_name: true, category_slug: true },
      }),
      prisma.courseSpecialization.findMany({
        where: { contents: { some: {} } },
        select: { id: true, name: true, slug: true },
        take: 10,
      }),
      seoService.getStaticPageSeo('blog-details', {
        title: blog.headline || '',
        category: category.category_name || '',
        currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
        currentyear: new Date().getFullYear().toString(),
        site: process.env.SITE_URL || '',
      }),
    ]);

    return {
      data: serializeBigInt(blog),
      related_blogs: serializeBigInt(relatedBlogs),
      categories: serializeBigInt(categories),
      specializations: serializeBigInt(specializations),
      seo: {
        meta_title: blog.meta_title || dynamicSeo.meta_title,
        meta_keyword: blog.meta_keyword || dynamicSeo.meta_keyword,
        meta_description: blog.meta_description || dynamicSeo.meta_description,
        og_image_path: blog.og_image_path || dynamicSeo.og_image_path,
        title: blog.headline
      },
    };
  }
}

export const blogService = BlogService.getInstance();
