import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Multiple Search-Apply Service (Singleton)
 */
export class MultipleSearchApplyService {
  private static instance: MultipleSearchApplyService;

  private constructor() {}

  static getInstance(): MultipleSearchApplyService {
    if (!MultipleSearchApplyService.instance) {
      MultipleSearchApplyService.instance = new MultipleSearchApplyService();
    }
    return MultipleSearchApplyService.instance;
  }

  /**
   * Normalize filter values (comma-separated string or array).
   */
  private normalize(value: any): any[] {
    if (!value) return [];
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');
    }
    if (Array.isArray(value)) return value;
    return [value];
  }

  /**
   * Get levels for a website and multiple universities.
   */
  async getLevels(website: string, universityIds?: any) {
    const normalizedIds = this.normalize(universityIds).map((id) => Number(id)).filter((id) => !Number.isNaN(id));

    const where: any = {
      website: website,
    };
    if (normalizedIds.length > 0) {
      where.university_id = { in: normalizedIds };
    }

    const levels = await prisma.universityProgram.findMany({
      where,
      select: {
        level: true,
      },
      distinct: ['level'],
    });

    return levels.filter((l) => l.level).map((l) => ({ level: l.level }));
  }

  /**
   * Get categories for a website, multiple universities, and multiple levels.
   */
  async getCategories(website: string, universityIds?: any, levels?: any) {
    const normalizedUniIds = this.normalize(universityIds).map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    const normalizedLevels = this.normalize(levels);

    const where: any = {
      website: website,
    };
    if (normalizedUniIds.length > 0) {
      where.university_id = { in: normalizedUniIds };
    }
    if (normalizedLevels.length > 0) {
      where.level = { in: normalizedLevels };
    }

    const programs = await prisma.universityProgram.findMany({
      where,
      select: {
        course_category_id: true,
      },
      distinct: ['course_category_id'],
    });

    const categoryIds = programs
      .map((p) => p.course_category_id)
      .filter((id): id is number => id !== null);

    const categories = await prisma.courseCategory.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return serializeBigInt(categories);
  }

  /**
   * Get specializations with multiple filters.
   */
  async getSpecializations(
    website: string,
    universityIds?: any,
    levels?: any,
    categoryIds?: any
  ) {
    const normalizedUniIds = this.normalize(universityIds).map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    const normalizedLevels = this.normalize(levels);
    const normalizedCatIds = this.normalize(categoryIds).map((id) => Number(id)).filter((id) => !Number.isNaN(id));

    const where: any = {
      website: website,
    };
    if (normalizedUniIds.length > 0) {
      where.university_id = { in: normalizedUniIds };
    }
    if (normalizedLevels.length > 0) {
      where.level = { in: normalizedLevels };
    }
    if (normalizedCatIds.length > 0) {
      where.course_category_id = { in: normalizedCatIds };
    }

    const programs = await prisma.universityProgram.findMany({
      where,
      select: {
        specialization_id: true,
      },
      distinct: ['specialization_id'],
    });

    const specializationIds = programs
      .map((p) => p.specialization_id)
      .filter((id): id is number => id !== null);

    const specializations = await prisma.courseSpecialization.findMany({
      where: {
        id: { in: specializationIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return serializeBigInt(specializations);
  }

  /**
   * Get paginated programs with multiple filters.
   */
  async getPrograms(filters: any, page = 1, perPage = 10) {
    const where: any = {};

    const websites = this.normalize(filters.website);
    if (websites.length > 0) where.website = { in: websites };

    const universityIds = this.normalize(filters.university_id).map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    if (universityIds.length > 0) where.university_id = { in: universityIds };

    const levels = this.normalize(filters.level);
    if (levels.length > 0) where.level = { in: levels };

    const categoryIds = this.normalize(filters.course_category_id).map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    if (categoryIds.length > 0) where.course_category_id = { in: categoryIds };

    const specializationIds = this.normalize(filters.specialization_id).map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    if (specializationIds.length > 0) where.specialization_id = { in: specializationIds };

    const [total, items] = await Promise.all([
      prisma.universityProgram.count({ where }),
      prisma.universityProgram.findMany({
        where,
        include: {
          university: {
            select: {
              id: true,
              name: true,
              uname: true,
              email: true,
              logo_path: true,
            },
          },
          courseCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          courseSpecialization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: serializeBigInt(items),
      pagination: {
        total,
        current_page: page,
        per_page: perPage,
        last_page: Math.ceil(total / perPage),
      },
    };
  }
}

export const multipleSearchApplyService = MultipleSearchApplyService.getInstance();
