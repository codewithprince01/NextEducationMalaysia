import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Search-Apply Service (Singleton)
 */
export class SearchApplyService {
  private static instance: SearchApplyService;

  private constructor() {}

  static getInstance(): SearchApplyService {
    if (!SearchApplyService.instance) {
      SearchApplyService.instance = new SearchApplyService();
    }
    return SearchApplyService.instance;
  }

  /**
   * Get all countries that have university programs.
   */
  async getCountries() {
    const data = await prisma.universityProgram.findMany({
      select: {
        website: true,
      },
      distinct: ['website'],
    });

    const websites = data.map((d) => d.website).filter((w): w is string => Boolean(w));

    if (websites.length === 0) return [];

    const countries = await prisma.$queryRawUnsafe(
      `SELECT name, iso3 FROM countries WHERE iso3 IN (${websites.map(() => '?').join(',')}) ORDER BY name ASC`,
      ...websites
    ) as any[];

    return countries.map((c) => ({
      website: c.iso3,
      name: c.name,
    }));
  }

  /**
   * Get all universities that have programs, optionally filtered by website.
   */
  async getUniversities(website?: string) {
    const where: any = {};
    if (website) {
      where.website = website;
    }

    const programs = await prisma.universityProgram.findMany({
      where,
      select: {
        university_id: true,
      },
      distinct: ['university_id'],
    });

    const universityIds = programs
      .map((p) => p.university_id)
      .filter((id): id is number => id !== null);

    const universities = await prisma.university.findMany({
      where: {
        id: {
          in: universityIds,
        },
      },
      select: {
        id: true,
        name: true,
        uname: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return serializeBigInt(universities);
  }

  /**
   * Get all levels for a specific university.
   */
  async getLevels(universityId: number) {
    const levels = await prisma.universityProgram.findMany({
      where: {
        university_id: universityId,
      },
      select: {
        level: true,
      },
      distinct: ['level'],
    });

    return levels.filter((l) => l.level).map((l) => ({ level: l.level }));
  }

  /**
   * Get all course categories for a specific university and level.
   */
  async getCategories(universityId: number, level?: string) {
    const where: any = {
      university_id: universityId,
    };
    if (level) {
      where.level = level;
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
        id: {
          in: categoryIds,
        },
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
   * Get all specializations for a specific university, level, and category.
   */
  async getSpecializations(universityId: number, level?: string, categoryId?: number) {
    const where: any = {
      university_id: universityId,
    };
    if (level) {
      where.level = level;
    }
    if (categoryId) {
      where.course_category_id = categoryId;
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
        id: {
          in: specializationIds,
        },
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
   * Get paginated programs with filters.
   */
  async getPrograms(filters: any, page = 1, perPage = 10) {
    const where: any = {};
    if (filters.university_id) where.university_id = Number(filters.university_id);
    if (filters.level) where.level = filters.level;
    if (filters.course_category_id) where.course_category_id = Number(filters.course_category_id);
    if (filters.specialization_id) where.specialization_id = Number(filters.specialization_id);
    if (filters.country) where.website = filters.country;

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

export const searchApplyService = SearchApplyService.getInstance();
