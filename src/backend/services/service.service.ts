import { prisma } from '@/lib/db-fresh';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Service Service (Singleton)
 */
export class ServiceService {
  private static instance: ServiceService;

  private constructor() {}

  static getInstance(): ServiceService {
    if (!ServiceService.instance) {
      ServiceService.instance = new ServiceService();
    }
    return ServiceService.instance;
  }

  /**
   * Get all active services.
   */
  async getServices() {
    try {
      const services = await prisma.$queryRawUnsafe('SELECT * FROM site_pages WHERE status = 1 ORDER BY id DESC');
      return serializeBigInt(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  /**
   * Get service by slug.
   */
  async getServiceBySlug(slug: string) {
    try {
      const result = await prisma.$queryRawUnsafe('SELECT * FROM site_pages WHERE slug = ? AND status = 1 LIMIT 1', slug) as any[];
      const service = result[0];

      if (!service) return null;

      // Fetch related data using raw queries as fallback
      const [additional_contents, site_page_tabs] = await Promise.all([
        prisma.$queryRawUnsafe('SELECT * FROM static_page_contents WHERE page_name = ? AND status = 1', service.slug),
        prisma.$queryRawUnsafe('SELECT * FROM site_page_tabs WHERE site_page_id = ? AND status = 1 ORDER BY id ASC', service.id)
      ]);

      return serializeBigInt({
        ...service,
        additional_contents,
        site_page_tabs
      });
    } catch (error) {
      console.error('Error fetching service by slug:', error);
      return null;
    }
  }

  /**
   * Get SEO for service page.
   */
  async getServiceSeo(slug: string) {
    try {
      const result = await prisma.$queryRawUnsafe('SELECT meta_title, meta_description, meta_keyword, og_image_path FROM site_pages WHERE slug = ? AND status = 1 LIMIT 1', slug) as any[];
      const service = result[0];

      if (!service) return null;

      return {
        title: service.meta_title,
        description: service.meta_description,
        keywords: service.meta_keyword,
        image: service.og_image_path,
      };
    } catch (error) {
      console.error('Error fetching service SEO:', error);
      return null;
    }
  }
}

export const serviceService = ServiceService.getInstance();
