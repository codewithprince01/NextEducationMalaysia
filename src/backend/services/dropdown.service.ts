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
    // Use deterministic aggregate to avoid ONLY_FULL_GROUP_BY issues
    const levels = await prisma.$queryRawUnsafe(`
      SELECT MIN(id) AS id, level, MIN(slug) AS slug, MIN(short_name) AS short_name
      FROM levels
      WHERE status = 1 OR status IS NULL
      GROUP BY level
      ORDER BY level ASC
    `);
    return serializeBigInt(levels);
  }

  /**
   * Get distinct course categories.
   */
  async getCourseCategories() {
    const categories = await prisma.$queryRawUnsafe(`
      SELECT
        MIN(id) AS id,
        name,
        MIN(slug) AS slug,
        MIN(icon_class) AS icon_class,
        MIN(thumbnail_path) AS thumbnail_path
      FROM course_categories
      WHERE website = 'MYS' AND (status IN (0, 1) OR status IS NULL)
      GROUP BY name
      ORDER BY name ASC
    `);
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
