import { prisma } from '@/lib/db-fresh';
import { serializeBigInt } from '@/lib/utils';
import { seoService } from './seo.service';
import { SITE_VAR } from '../utils/constants';

/**
 * Enterprise Home Service (Singleton)
 */
export class HomeService {
  private static instance: HomeService;

  private constructor() {}

  static getInstance(): HomeService {
    if (!HomeService.instance) {
      HomeService.instance = new HomeService();
    }
    return HomeService.instance;
  }

  /**
   * Get all data for the homepage.
   */
  async getHomeData() {
    try {
      const [
        featuredUniversities,
        qsRankUniversities,
        otherUniversities,
        homeContent,
        testimonials,
      ] = await Promise.all([
        prisma.university.findMany({
          where: { status: 1, homeview: 1 as any },
          include: {
            instituteType: true,
            _count: { select: { programs: { where: { status: 1 } } } },
          },
          take: 12,
        }),
        prisma.university.findMany({
          where: {
            status: 1,
            homeview: 1 as any,
            NOT: [
              { qs_rank: null },
              { qs_rank: '0' },
              { qs_rank: '' },
              { qs_rank: 'N/A' },
            ],
          },
          include: {
            _count: { select: { programs: { where: { status: 1 } } } },
          },
          orderBy: { qs_rank: 'asc' },
          take: 30,
        }),
        prisma.university.findMany({
          where: { status: 1, homeview: 1 as any },
          include: {
            instituteType: true,
            _count: { select: { programs: { where: { status: 1 } } } },
          },
          take: 20,
        }),
        prisma.$queryRawUnsafe('SELECT * FROM static_page_contents WHERE page_name = "home" AND status = 1 LIMIT 1').then(res => (res as any)[0] || null),
        prisma.$queryRawUnsafe('SELECT * FROM testimonials WHERE status = 1 LIMIT 20'),
      ]);

      const seoMeta = await seoService.getStaticPageSeo('home', {
        title: 'Home',
        description: 'Welcome to Next Education Malaysia',
      });

      return {
        featuredUniversities: serializeBigInt(featuredUniversities.map((u: any) => ({
          ...u,
          active_programs_count: u._count.programs,
        }))),
        qsRankUniversities: serializeBigInt(qsRankUniversities.map((u: any) => ({
          ...u,
          active_programs_count: u._count.programs,
        }))),
        otherUniversities: serializeBigInt(otherUniversities.map((u: any) => ({
          ...u,
          active_programs_count: u._count.programs,
        }))),
        homeContent: serializeBigInt(homeContent),
        testimonials: serializeBigInt(testimonials),
        seo: seoMeta,
      };
    } catch (error) {
      console.error('Error fetching home data:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a course category.
   */
  async getCourseCategoryDetail(slug: string) {
    try {
      const categoryResult = await prisma.$queryRawUnsafe(
        'SELECT * FROM course_categories WHERE slug = ? AND website = ? LIMIT 1',
        slug,
        SITE_VAR
      ) as any[];
      const category = categoryResult[0];

      if (!category) {
        return null;
      }
      const categoryId = Number(category.id);

      const [contents, faqs, otherCategories, relatedUniversities, featuredUniversities] = await Promise.all([
        prisma.$queryRawUnsafe('SELECT * FROM course_category_contents WHERE course_category_id = ?', categoryId),
        prisma.$queryRawUnsafe('SELECT * FROM course_category_faqs WHERE course_category_id = ? AND status = 1', categoryId),
        prisma.courseCategory.findMany({
          where: { id: { not: categoryId }, status: 1 as any },
          select: { id: true, name: true, slug: true, og_image_path: true },
          orderBy: { name: 'asc' },
          take: 10
        }),
        prisma.university.findMany({
          where: {
            status: 1 as any,
            programs: { some: { course_category_id: categoryId, status: 1 as any } },
          },
          select: {
            id: true,
            name: true,
            uname: true,
            logo_path: true,
            city: true,
            state: true,
            institute_type: true,
            click: true,
            established_year: true,
            _count: { select: { programs: { where: { status: 1 as any } } } },
          },
        }),
        prisma.university.findMany({
          where: { status: 1 as any },
          select: {
            id: true,
            name: true,
            uname: true,
            logo_path: true,
            city: true,
            state: true,
            institute_type: true,
            click: true,
            established_year: true,
            _count: { select: { programs: { where: { status: 1 as any } } } },
          },
          take: 10,
        }),
      ]);

      const seoMeta = await seoService.getStaticPageSeo('subjectdetailpage', {
        title: category.name || 'Category',
        description: category.description || '',
      });

      const categoryWithRelations = {
        ...category,
        contents: contents || [],
        faqs: faqs || [],
      };

      return {
        category: serializeBigInt(categoryWithRelations),
        contents: serializeBigInt(contents),
        faqs: serializeBigInt(faqs),
        otherCategories: serializeBigInt(otherCategories),
        relatedUniversities: serializeBigInt(relatedUniversities),
        featuredUniversities: serializeBigInt(featuredUniversities),
        seo: seoMeta,
      };
    } catch (error) {
      console.error('Error fetching course category detail:', error);
      throw error;
    }
  }

  /**
   * Placeholder for banners.
   */
  async getBanners(page: string) {
    try {
      const banners = await prisma.$queryRawUnsafe('SELECT * FROM page_banners WHERE page = ? AND status = 1', page);
      return serializeBigInt(banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  }

  /**
   * Placeholder for page contents.
   */
  async getPageContents(page: string) {
    try {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT * FROM page_contents WHERE page_name = ? AND website = ? LIMIT 1',
        page,
        SITE_VAR
      ) as any[];
      const contents = rows[0] || null;

      return {
        contents: serializeBigInt(contents),
      };
    } catch (error) {
      console.error('Error fetching page contents:', error);
      return {
        contents: null,
      };
    }
  }

  /**
   * Placeholder for courses by level.
   */
  async getCoursesByLevel(level: string) {
    try {
      const courses = await prisma.universityProgram.findMany({
        where: { level, status: 1 },
        include: { university: true },
        take: 10,
      });
      return serializeBigInt(courses);
    } catch (error) {
      console.error('Error fetching courses by level:', error);
      return [];
    }
  }
}

export const homeService = HomeService.getInstance();
