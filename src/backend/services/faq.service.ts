import { prisma } from '@/lib/db-fresh';
import { seoService } from './seo.service';

/**
 * Enterprise FAQ Service (Singleton)
 */
export class FaqService {
  private static instance: FaqService;

  private constructor() {}

  static getInstance(): FaqService {
    if (!FaqService.instance) {
      FaqService.instance = new FaqService();
    }
    return FaqService.instance;
  }

  /**
   * Get all FAQ categories that have FAQs, including SEO data for the main FAQ page.
   */
  async getFaqCategories() {
    const categories = await prisma.$queryRawUnsafe(
      `
      SELECT fc.id, fc.category_name, fc.category_slug
      FROM faq_categories fc
      WHERE EXISTS (
        SELECT 1 FROM faqs f WHERE f.category_id = fc.id
      )
      ORDER BY fc.id ASC
      `
    ) as any[];

    const seo = await seoService.getStaticPageSeo('faqs');

    return {
      categories,
      seo,
    };
  }

  /**
   * Get details for a specific FAQ category, including its FAQs and all categories for navigation.
   */
  async getFaqCategoryDetail(slug: string) {
    const categoryRows = await prisma.$queryRawUnsafe(
      `
      SELECT id, category_name, category_slug
      FROM faq_categories
      WHERE category_slug = ?
      LIMIT 1
      `,
      slug
    ) as any[];
    const category = categoryRows?.[0];

    if (!category) {
      return null; // Let the caller handle 404
    }

    const [faqs, categories] = await Promise.all([
      prisma.$queryRawUnsafe(
        `
        SELECT id, category_id, question, answer
        FROM faqs
        WHERE category_id = ?
        ORDER BY id ASC
        `,
        Number(category.id)
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `
        SELECT fc.id, fc.category_name, fc.category_slug
        FROM faq_categories fc
        WHERE EXISTS (
          SELECT 1 FROM faqs f WHERE f.category_id = fc.id
        )
        ORDER BY fc.id ASC
        `
      ) as Promise<any[]>,
    ]);

    const seo = await seoService.getStaticPageSeo(`faq/${slug}`);

    return {
      category,
      faqs,
      categories,
      seo,
    };
  }
}

export const faqService = FaqService.getInstance();
