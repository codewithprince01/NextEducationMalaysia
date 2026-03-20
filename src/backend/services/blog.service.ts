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
          select: {
            id: true,
            headline: true,
            slug: true,
            thumbnail_path: true,
            created_at: true,
            category_id: true,
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
      select: {
        id: true,
        category_name: true,
        category_slug: true,
        meta_title: true,
        meta_keyword: true,
        meta_description: true,
        og_image_path: true,
      },
    });

    if (!category) return null;

    const skip = (page - 1) * pageSize;

    const [blogs, total, dynamicSeo] = await Promise.all([
      prisma.blog.findMany({
        where: { category_id: category.id, status: 1 },
        select: {
          id: true,
          headline: true,
          slug: true,
          thumbnail_path: true,
          created_at: true,
          category_id: true,
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
      select: {
        id: true,
        category_name: true,
        category_slug: true,
        meta_title: true,
        meta_keyword: true,
        meta_description: true,
        og_image_path: true,
      },
    });

    const idMatch = slugWithId.match(/\d+$/);
    const blogId = idMatch ? Number.parseInt(idMatch[0], 10) : null;
    const slug = slugWithId.replace(/-\d+$/, '');

    if (!blogId || !Number.isFinite(blogId)) return null;

    const blogSelect = {
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
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          category_name: true,
          category_slug: true,
        },
      },
    };

    let blog = category
      ? await prisma.blog.findFirst({
          where: {
            category_id: category.id,
            slug: slug,
            id: blogId,
            status: 1,
          },
          select: blogSelect,
        })
      : null;

    // Fallback: keep category + id strict, but don't fail hard on minor slug mismatch.
    if (!blog && category) {
      blog = await prisma.blog.findFirst({
        where: {
          category_id: category.id,
          id: blogId,
          status: 1,
        },
        select: blogSelect,
      });
    }

    // Final fallback: resolve by ID globally so detail opens even if URL category is wrong.
    if (!blog) {
      blog = await prisma.blog.findFirst({
        where: {
          id: blogId,
          status: 1,
        },
        select: blogSelect,
      });
    }

    if (!blog) return null;
    const effectiveCategory = blog.category || category;
    const allContents = await prisma.$queryRawUnsafe<Array<{
      id: number
      title: string | null
      description: string | null
      parent_id: number | null
      position: number | null
    }>>(
      `
      SELECT id, title, description, parent_id, position
      FROM blog_contents
      WHERE blog_id = ?
      ORDER BY position ASC, id ASC
      `,
      Number(blog.id),
    );

    const parentContents = allContents
      .filter((item) => item.parent_id === null)
      .map((parent) => ({
        id: parent.id,
        title: parent.title || '',
        tab: parent.title || '',
        description: parent.description || '',
        position: parent.position ?? 0,
        child_contents: allContents
          .filter((child) => child.parent_id === parent.id)
          .map((child) => ({
            id: child.id,
            title: child.title || '',
            tab: child.title || '',
            description: child.description || '',
            position: child.position ?? 0,
          })),
      }));

    const [relatedBlogs, categories, specializations, dynamicSeo] = await Promise.all([
      prisma.blog.findMany({
        where: { id: { not: blog.id }, status: 1 },
        select: {
          id: true,
          headline: true,
          slug: true,
          thumbnail_path: true,
          created_at: true,
          category: {
            select: {
              id: true,
              category_name: true,
              category_slug: true,
            },
          },
        },
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
        category: effectiveCategory?.category_name || '',
        currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
        currentyear: new Date().getFullYear().toString(),
        site: process.env.SITE_URL || '',
      }),
    ]);

    return {
      data: serializeBigInt({
        ...blog,
        parent_contents: parentContents,
      }),
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

  async getBlogDetailById(id: number) {
    const blog = await prisma.blog.findFirst({
      where: { id, status: 1 },
      select: {
        id: true,
        slug: true,
        category: {
          select: {
            category_slug: true,
          },
        },
      },
    });

    if (!blog?.slug || !blog?.category?.category_slug) return null;
    return this.getBlogDetail(blog.category.category_slug, `${blog.slug}-${blog.id}`);
  }
}

export const blogService = BlogService.getInstance();
