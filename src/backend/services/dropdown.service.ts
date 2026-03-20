import { prisma } from '@/lib/db-fresh';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Dropdown Service (Singleton)
 */
export class DropdownService {
  private static instance: DropdownService;

  private constructor() {}

  static getInstance(): DropdownService {
    if (!DropdownService.instance) {
      DropdownService.instance = new DropdownService();
    }
    return DropdownService.instance;
  }

  /**
   * Get distinct course levels.
   */
  async getLevels() {
    // Falls back to raw query because 'short_name' or 'name' column mismatch in Prisma client
    const levels = await prisma.$queryRawUnsafe('SELECT id, level, slug, short_name FROM levels GROUP BY level ORDER BY level ASC');
    return serializeBigInt(levels);
  }

  /**
   * Get distinct course categories.
   */
  async getCourseCategories() {
    const categories = await prisma.$queryRawUnsafe('SELECT id, name, slug, icon_class, thumbnail_path FROM course_categories GROUP BY name ORDER BY name ASC');
    return serializeBigInt(categories);
  }

  /**
   * Get gender options.
   */
  async getGenders() {
    const genders = await prisma.$queryRawUnsafe('SELECT id, gender FROM genders ORDER BY gender ASC');
    return serializeBigInt(genders);
  }

  /**
   * Get marital status options.
   */
  async getMaritalStatuses() {
    const statuses = await prisma.$queryRawUnsafe('SELECT id, marital_status FROM marital_statuses ORDER BY marital_status ASC');
    return serializeBigInt(statuses);
  }
}

export const dropdownService = DropdownService.getInstance();
