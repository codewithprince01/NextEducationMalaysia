import { prisma } from '@/lib/db';
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
    const categories = await prisma.faqCategory.findMany({
      where: {
        faqs: {
          some: {},
        },
      },
    });

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
    const category = await prisma.faqCategory.findFirst({
      where: { category_slug: slug },
    });

    if (!category) {
      return null; // Let the caller handle 404
    }

    const [faqs, categories] = await Promise.all([
      prisma.faq.findMany({
        where: { category_id: category.id },
      }),
      prisma.faqCategory.findMany({
        where: {
          faqs: {
            some: {},
          },
        },
      }),
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
