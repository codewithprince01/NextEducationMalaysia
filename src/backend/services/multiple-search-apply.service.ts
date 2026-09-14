import { prisma } from "@/lib/db";
import { serializeBigInt } from "@/lib/utils";

/**
 * Enterprise Multiple Search-Apply Service (Singleton)
 * 1:1 Match to Laravel MultipleSearchAndApplyApiController
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
   * Helper to normalize comma-separated strings or arrays into cleaned arrays.
   */
  private normalize(value: any): any[] {
    if (value === null || value === undefined) return [];
    if (typeof value === "string") {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    }
    if (Array.isArray(value)) {
      return value
        .map((s) => (typeof s === "string" ? s.trim() : s))
        .filter((s) => s !== null && s !== "");
    }
    return [value];
  }

  /**
   * 1. GET /levels
   * Match: MultipleSearchAndApplyApiController::levels
   * $website is required (returns null if missing so route can send 422)
   */
  async getLevels(website?: string, universityIds?: any) {
    if (!website || !website.trim()) return null;

    const normalizedIds = this.normalize(universityIds)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    const params: any[] = [website.trim()];
    let uniWhere = "";

    if (normalizedIds.length > 0) {
      uniWhere = `AND university_id IN (${normalizedIds.map(() => "?").join(",")})`;
      params.push(...normalizedIds);
    }

    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT level
      FROM university_programs
      WHERE website = ? ${uniWhere} AND level IS NOT NULL AND level != ''
      GROUP BY level
    `,
      ...params,
    )) as any[];

    return rows.map((r) => ({ level: r.level }));
  }

  /**
   * 2. GET /categories
   * Match: MultipleSearchAndApplyApiController::categories
   * $website is required (returns null if missing so route can send 422)
   */
  async getCategories(website?: string, universityIds?: any, levels?: any) {
    if (!website || !website.trim()) return null;

    const normalizedUniIds = this.normalize(universityIds)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    const normalizedLevels = this.normalize(levels);

    const params: any[] = [website.trim()];
    let uniWhere = "";
    if (normalizedUniIds.length > 0) {
      uniWhere = `AND up.university_id IN (${normalizedUniIds.map(() => "?").join(",")})`;
      params.push(...normalizedUniIds);
    }

    let levelWhere = "";
    if (normalizedLevels.length > 0) {
      levelWhere = `AND up.level IN (${normalizedLevels.map(() => "?").join(",")})`;
      params.push(...normalizedLevels);
    }

    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT DISTINCT cc.name, cc.slug, cc.id
      FROM university_programs up
      JOIN course_categories cc ON up.course_category_id = cc.id
      WHERE up.website = ? ${uniWhere} ${levelWhere}
    `,
      ...params,
    )) as any[];

    return serializeBigInt(
      rows.map((r) => ({ name: r.name, slug: r.slug, id: r.id })),
    );
  }

  /**
   * 3. GET /specializations
   * Match: MultipleSearchAndApplyApiController::specializations
   * $website is required (returns null if missing so route can send 422)
   */
  async getSpecializations(
    website?: string,
    universityIds?: any,
    levels?: any,
    categoryIds?: any,
  ) {
    if (!website || !website.trim()) return null;

    const normalizedUniIds = this.normalize(universityIds)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    const normalizedLevels = this.normalize(levels);
    const normalizedCatIds = this.normalize(categoryIds)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    const params: any[] = [website.trim()];
    let uniWhere = "";
    if (normalizedUniIds.length > 0) {
      uniWhere = `AND up.university_id IN (${normalizedUniIds.map(() => "?").join(",")})`;
      params.push(...normalizedUniIds);
    }

    let levelWhere = "";
    if (normalizedLevels.length > 0) {
      levelWhere = `AND up.level IN (${normalizedLevels.map(() => "?").join(",")})`;
      params.push(...normalizedLevels);
    }

    let catWhere = "";
    if (normalizedCatIds.length > 0) {
      catWhere = `AND up.course_category_id IN (${normalizedCatIds.map(() => "?").join(",")})`;
      params.push(...normalizedCatIds);
    }

    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT DISTINCT cs.name, cs.slug, cs.id
      FROM university_programs up
      JOIN course_specializations cs ON up.specialization_id = cs.id
      WHERE up.website = ? ${uniWhere} ${levelWhere} ${catWhere}
    `,
      ...params,
    )) as any[];

    return serializeBigInt(
      rows.map((r) => ({ name: r.name, slug: r.slug, id: r.id })),
    );
  }

  /**
   * 4. GET /programs
   * Match: MultipleSearchAndApplyApiController::programs
   */
  async getPrograms(filters: any, page = 1, perPage = 10) {
    const where: any = {};

    const websites = this.normalize(filters.website);
    if (websites.length > 0) where.website = { in: websites };

    const universityIds = this.normalize(filters.university_id)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    if (universityIds.length > 0) where.university_id = { in: universityIds };

    const levels = this.normalize(filters.level);
    if (levels.length > 0) where.level = { in: levels };

    const categoryIds = this.normalize(filters.course_category_id)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    if (categoryIds.length > 0) where.course_category_id = { in: categoryIds };

    const specializationIds = this.normalize(filters.specialization_id)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    if (specializationIds.length > 0)
      where.specialization_id = { in: specializationIds };

    const [total, items] = await Promise.all([
      prisma.universityProgram.count({ where }),
      prisma.universityProgram.findMany({
        where,
        select: {
          id: true,
          website: true,
          university_id: true,
          course_category_id: true,
          specialization_id: true,
          level: true,
          course_name: true,
          intake: true,
          study_mode: true,
          duration: true,
          application_deadline: true,
          tution_fee: true,
          total_fee: true,
          total_tuition_fee: true,
          commission: true,
          university: {
            select: {
              id: true,
              name: true,
              uname: true,
              email: true,
              cc: true,
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
          id: "desc",
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    const formattedItems = items.map((item: any) => ({
      id: item.id,
      website: item.website,
      university_id: item.university_id,
      course_category_id: item.course_category_id,
      specialization_id: item.specialization_id,
      level: item.level,
      course_name: item.course_name,
      intake: item.intake,
      study_mode: item.study_mode,
      duration: item.duration,
      application_deadline: item.application_deadline,
      tution_fee: item.tution_fee != null ? String(item.tution_fee) : null,
      total_fee: item.total_fee != null ? String(item.total_fee) : null,
      total_tuition_fee:
        item.total_tuition_fee != null ? String(item.total_tuition_fee) : null,
      commission: item.commission != null ? item.commission : null,
      university: item.university
        ? {
            id: item.university.id,
            name: item.university.name,
            uname: item.university.uname,
            email: item.university.email ?? null,
            cc: item.university.cc ?? null,
            logo_path: item.university.logo_path ?? null,
          }
        : null,
      course_category: item.courseCategory,
      course_specialization: item.courseSpecialization,
    }));

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

export const multipleSearchApplyService =
  MultipleSearchApplyService.getInstance();
