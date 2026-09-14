import { prisma } from "@/lib/db";
import { serializeBigInt } from "@/lib/utils";

/**
 * Enterprise Search-Apply Service (Singleton)
 * 1:1 Match to Laravel SearchAndApplyApiController
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
   * 1. GET /countries
   * Match: DB::table('university_programs')
   *   ->select('university_programs.website', 'countries.name')
   *   ->join('countries', 'university_programs.website', '=', 'countries.iso3')
   *   ->groupBy('university_programs.website', 'countries.name')
   */
  async getCountries() {
    const rows = (await prisma.$queryRawUnsafe(`
      SELECT up.website, c.name
      FROM university_programs up
      JOIN countries c ON up.website = c.iso3
      WHERE up.website IS NOT NULL AND up.website != ''
      GROUP BY up.website, c.name
    `)) as any[];

    return rows.map((r) => ({
      website: r.website,
      name: r.name,
    }));
  }

  /**
   * 2. GET /universities
   * Match: DB::table('university_programs')
   *   ->select('universities.name', 'universities.uname', 'universities.id')
   *   ->join('universities', 'university_programs.university_id', '=', 'universities.id')
   *   ->groupBy('university_programs.university_id', 'universities.name', 'universities.uname', 'universities.id')
   *   ->where('university_programs.website', $website)
   */
  async getUniversities(website?: string) {
    const params: any[] = [];
    let whereClause = "";
    if (website && website.trim()) {
      whereClause = "WHERE up.website = ?";
      params.push(website.trim());
    }

    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT u.name, u.uname, u.id
      FROM university_programs up
      JOIN universities u ON up.university_id = u.id
      ${whereClause}
      GROUP BY up.university_id, u.name, u.uname, u.id
    `,
      ...params,
    )) as any[];

    return serializeBigInt(
      rows.map((r) => ({ name: r.name, uname: r.uname, id: r.id })),
    );
  }

  /**
   * 3. GET /levels
   * Match: DB::table('university_programs')
   *   ->select('level')
   *   ->where('university_id', $university_id)
   *   ->groupBy('level')
   */
  async getLevels(universityId?: number, website?: string) {
    const params: any[] = [];
    const whereConditions: string[] = [];

    if (universityId) {
      whereConditions.push("university_id = ?");
      params.push(universityId);
    } else {
      whereConditions.push("university_id IS NULL");
    }

    if (website && website.trim()) {
      whereConditions.push("website = ?");
      params.push(website.trim());
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT level
      FROM university_programs
      ${whereClause}
      GROUP BY level
    `,
      ...params,
    )) as any[];

    return rows.map((r) => ({ level: r.level }));
  }

  /**
   * 4. GET /categories
   * Match: DB::table('university_programs')
   *   ->select('course_categories.name', 'course_categories.slug', 'course_categories.id')
   *   ->join('course_categories', 'university_programs.course_category_id', '=', 'course_categories.id')
   *   ->where('university_programs.university_id', $university_id)
   *   ->where('university_programs.level', $level)
   *   ->groupBy(...)
   */
  async getCategories(universityId?: number, level?: string) {
    const params: any[] = [];
    const whereConditions: string[] = [];

    if (universityId) {
      whereConditions.push("up.university_id = ?");
      params.push(universityId);
    } else {
      whereConditions.push("up.university_id IS NULL");
    }

    if (level && level.trim()) {
      whereConditions.push("up.level = ?");
      params.push(level.trim());
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT cc.name, cc.slug, cc.id
      FROM university_programs up
      JOIN course_categories cc ON up.course_category_id = cc.id
      ${whereClause}
      GROUP BY up.course_category_id, cc.name, cc.slug, cc.id
    `,
      ...params,
    )) as any[];

    return serializeBigInt(
      rows.map((r) => ({ name: r.name, slug: r.slug, id: r.id })),
    );
  }

  /**
   * 5. GET /specializations
   * Match: DB::table('university_programs')
   *   ->select('course_specializations.name', 'course_specializations.slug', 'course_specializations.id')
   *   ->join('course_specializations', 'university_programs.specialization_id', '=', 'course_specializations.id')
   *   ->where('university_programs.university_id', $university_id)
   *   ->where('university_programs.level', $level)
   *   ->where('university_programs.course_category_id', $course_category_id)
   *   ->groupBy(...)
   */
  async getSpecializations(
    universityId?: number,
    level?: string,
    categoryId?: number,
  ) {
    const params: any[] = [];
    const whereConditions: string[] = [];

    if (universityId) {
      whereConditions.push("up.university_id = ?");
      params.push(universityId);
    } else {
      whereConditions.push("up.university_id IS NULL");
    }

    if (level && level.trim()) {
      whereConditions.push("up.level = ?");
      params.push(level.trim());
    }

    if (categoryId) {
      whereConditions.push("up.course_category_id = ?");
      params.push(categoryId);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT cs.name, cs.slug, cs.id
      FROM university_programs up
      JOIN course_specializations cs ON up.specialization_id = cs.id
      ${whereClause}
      GROUP BY up.specialization_id, cs.name, cs.slug, cs.id
    `,
      ...params,
    )) as any[];

    return serializeBigInt(
      rows.map((r) => ({ name: r.name, slug: r.slug, id: r.id })),
    );
  }

  /**
   * 6. GET /programs
   * Match: UniversityProgram::with(['university', 'courseCategory', 'courseSpecialization'])
   *   ->where('university_id', ...)
   *   ->where('level', ...)
   *   ->where('course_category_id', ...)
   *   ->where('specialization_id', ...)
   *   ->orderBy('id', 'desc')->paginate($perPage)
   */
  async getPrograms(filters: any, page = 1, perPage = 10) {
    const where: any = {};
    if (filters.university_id)
      where.university_id = Number(filters.university_id);
    if (filters.level) where.level = filters.level;
    if (filters.course_category_id)
      where.course_category_id = Number(filters.course_category_id);
    if (filters.specialization_id)
      where.specialization_id = Number(filters.specialization_id);
    if (filters.country) where.website = filters.country;

    const [total, items] = await Promise.all([
      prisma.universityProgram.count({ where }),
      prisma.universityProgram.findMany({
        where,
        select: {
          id: true,
          university_id: true,
          course_name: true,
          slug: true,
          level: true,
          study_mode: true,
          intake: true,
          duration: true,
          tution_fee: true,
          application_deadline: true,
          accreditations: true,
          course_category_id: true,
          specialization_id: true,
          status: true,
          meta_title: true,
          meta_description: true,
          meta_keyword: true,
          og_image_path: true,
          overview: true,
          website: true,
          created_at: true,
          updated_at: true,
          university: true,
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
          id: "desc",
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    const formattedItems = items.map((item: any) => {
      const { courseCategory, courseSpecialization, ...rest } = item;
      return {
        ...rest,
        course_category: courseCategory,
        course_specialization: courseSpecialization,
      };
    });

    return {
      items: serializeBigInt(formattedItems),
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total,
      },
    };
  }
}

export const searchApplyService = SearchApplyService.getInstance();
