import { prisma } from '@/lib/db';
import { resolveSeoMeta } from './seo.service';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Scholarship Service (Singleton)
 */
export class ScholarshipService {
  private static instance: ScholarshipService;

  private constructor() {}

  static getInstance(): ScholarshipService {
    if (!ScholarshipService.instance) {
      ScholarshipService.instance = new ScholarshipService();
    }
    return ScholarshipService.instance;
  }

  /**
   * Fetches all scholarships exactly like Laravel ScholarshipApi@index
   */
  async getScholarships() {
    const [scholarships, seo] = await Promise.all([
      prisma.scholarship.findMany({
        where: { website: 'MYS' },
        orderBy: { id: 'desc' }
      }),
      resolveSeoMeta('scholarships', {
        currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
        currentyear: new Date().getFullYear().toString(),
        site: process.env.SITE_URL || ''
      })
    ]);

    return {
      data: serializeBigInt(scholarships),
      seo
    };
  }

  /**
   * Fetches scholarship details exactly like Laravel ScholarshipApi@details
   */
  async getScholarshipDetail(slug: string) {
    const scholarship = await prisma.scholarship.findFirst({
      where: { slug, website: 'MYS' },
      include: {
        contents: {
          orderBy: { position: 'asc' }
        },
        faqs: {
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!scholarship) return null;

    const [otherScholarships, dynamicSeo] = await Promise.all([
      prisma.scholarship.findMany({
        where: { id: { not: scholarship.id }, website: 'MYS' },
        select: { id: true, title: true, slug: true },
        take: 12
      }),
      resolveSeoMeta('scholarship-detail-page', {
        title: scholarship.title,
        currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
        currentyear: new Date().getFullYear().toString(),
        site: process.env.SITE_URL || ''
      })
    ]);

    const seo = {
      meta_title: scholarship.meta_title || dynamicSeo.meta_title,
      meta_keyword: scholarship.meta_keyword || dynamicSeo.meta_keyword,
      meta_description: scholarship.meta_description || dynamicSeo.meta_description,
      og_image_path: scholarship.og_image_path || dynamicSeo.og_image_path,
      seo_rating_schema: true,
      title: scholarship.title
    };

    return {
      data: serializeBigInt({
        scholarship,
        other_scholarships: otherScholarships,
      }),
      seo
    };
  }
}

export const scholarshipService = ScholarshipService.getInstance();
