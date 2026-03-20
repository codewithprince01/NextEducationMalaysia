import { prisma } from '@/lib/db';
import { resolveSeo } from '../utils/seo-tags';
import type { SeoMeta } from '../types';

export class SeoService {
  private static instance: SeoService;

  private constructor() {}

  static getInstance(): SeoService {
    if (!SeoService.instance) {
      SeoService.instance = new SeoService();
    }
    return SeoService.instance;
  }

  async getStaticPageSeo(
    page: string,
    extra: Record<string, string> = {}
  ): Promise<SeoMeta> {
    try {
      // Use $queryRawUnsafe to bypass Prisma client validation for fields like seo_rating/page_content
      const results: any[] = await prisma.$queryRawUnsafe(
        'SELECT meta_title, meta_keyword, meta_description, og_image_path, seo_rating, page_content, page FROM static_page_seos WHERE page = ? LIMIT 1',
        page
      );

      let seo = results.length > 0 ? results[0] : null;

      if (!seo && page !== 'home') {
        const homeResults: any[] = await prisma.$queryRawUnsafe(
          'SELECT meta_title, meta_keyword, meta_description, og_image_path, seo_rating, page_content, page FROM static_page_seos WHERE page = "home" LIMIT 1'
        );
        seo = homeResults.length > 0 ? homeResults[0] : null;
      }

      const resolved = resolveSeo({ model: seo, tagMap: extra });
      
      return {
        ...resolved,
        source_page: seo?.page === page ? page : 'home'
      } as any;
    } catch (error) {
      console.error('SeoService.getStaticPageSeo error:', error);
      // Absolute fallback to empty SEO object to prevent page crash
      return resolveSeo({ model: null, tagMap: extra }) as any;
    }
  }

  async getDynamicPageSeo(url: string) {
    try {
      const results: any[] = await prisma.$queryRawUnsafe(
        'SELECT meta_title, meta_keyword, meta_description, og_image_path, seo_rating, page_content FROM dynamic_page_seos WHERE url = ? LIMIT 1',
        url
      );
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('SeoService.getDynamicPageSeo error:', error);
      return null;
    }
  }

  async resolveDetailPageSeo(
    model: {
      meta_title?: string | null;
      meta_keyword?: string | null;
      meta_description?: string | null;
      page_content?: string | null;
      seo_rating?: string | null;
      content_image_path?: string | null;
      og_image_path?: string | null;
    } | null,
    dseoKey: string,
    extra: Record<string, string> = {}
  ): Promise<SeoMeta> {
    const fallback = await this.getDynamicPageSeo(dseoKey);
    return resolveSeo({ model, fallback, tagMap: extra });
  }
}

export const seoService = SeoService.getInstance();

export const resolveSeoMeta = (page: string, extra: Record<string, string> = {}) => 
  seoService.getStaticPageSeo(page, extra);

export const resolveDetailPageSeo = (model: any, dseoKey: string, extra: Record<string, string> = {}) => 
  seoService.resolveDetailPageSeo(model, dseoKey, extra);
