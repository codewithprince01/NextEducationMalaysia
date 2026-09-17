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
   * Returns ALL fields from university_programs table EXCEPT the 17 specified fields:
   *   - tution_fee, exam_fee, tutions_fee, total_fee, total_tuition_fee, annual_tuition_fee,
   *     scholarship_amount, tution_fee_after_scholarship, year1_tuition_fee, year2_tuition_fee,
   *     year3_tuition_fee, year4_tuition_fee
   *   - meta_title, meta_description, meta_keyword, og_image_path, page_content
   * And includes nested university with ALL fields EXCEPT:
   *   - meta_title, meta_description, meta_keyword, og_image_path, page_content
   */
  async getPrograms(filters: any, page = 1, perPage = 10) {
    const EXCLUDED_PROGRAM_FIELDS = [
      'tution_fee',
      'exam_fee',
      'tutions_fee',
      'total_fee',
      'total_tuition_fee',
      'annual_tuition_fee',
      'scholarship_amount',
      'tution_fee_after_scholarship',
      'year1_tuition_fee',
      'year2_tuition_fee',
      'year3_tuition_fee',
      'year4_tuition_fee',
      'meta_title',
      'meta_description',
      'meta_keyword',
      'og_image_path',
      'page_content',
    ];

    const EXCLUDED_UNIVERSITY_FIELDS = [
      'meta_title',
      'meta_description',
      'meta_keyword',
      'og_image_path',
      'page_content',
    ];

    const whereClauses: string[] = [];
    const params: any[] = [];

    const websites = this.normalize(filters.website || filters.country);
    if (websites.length > 0) {
      whereClauses.push(`up.website IN (${websites.map(() => '?').join(',')})`);
      params.push(...websites);
    }

    const universityIds = this.normalize(filters.university_id)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    if (universityIds.length > 0) {
      whereClauses.push(`up.university_id IN (${universityIds.map(() => '?').join(',')})`);
      params.push(...universityIds);
    }

    const levels = this.normalize(filters.level);
    if (levels.length > 0) {
      whereClauses.push(`up.level IN (${levels.map(() => '?').join(',')})`);
      params.push(...levels);
    }

    const categoryIds = this.normalize(filters.course_category_id)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    if (categoryIds.length > 0) {
      whereClauses.push(`up.course_category_id IN (${categoryIds.map(() => '?').join(',')})`);
      params.push(...categoryIds);
    }

    const specializationIds = this.normalize(filters.specialization_id)
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    if (specializationIds.length > 0) {
      whereClauses.push(`up.specialization_id IN (${specializationIds.map(() => '?').join(',')})`);
      params.push(...specializationIds);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM university_programs up ${whereSql}`;
    const dataQuery = `
      SELECT up.*
      FROM university_programs up
      ${whereSql}
      ORDER BY up.id DESC
      LIMIT ? OFFSET ?
    `;

    const offset = (page - 1) * perPage;
    const [countResult, programs] = await Promise.all([
      prisma.$queryRawUnsafe(countQuery, ...params) as Promise<any[]>,
      prisma.$queryRawUnsafe(dataQuery, ...params, perPage, offset) as Promise<any[]>,
    ]);

    const total = Number(countResult[0]?.total || 0);

    if (programs.length === 0) {
      return {
        items: [],
        pagination: {
          current_page: page,
          last_page: Math.ceil(total / perPage) || 0,
          per_page: perPage,
          total,
        },
      };
    }

    const uniIds = [...new Set(programs.map((p) => p.university_id).filter(Boolean))];
    const catIds = [...new Set(programs.map((p) => p.course_category_id).filter(Boolean))];
    const specIds = [...new Set(programs.map((p) => p.specialization_id).filter(Boolean))];

    const [universities, categories, specializations] = await Promise.all([
      uniIds.length > 0
        ? (prisma.$queryRawUnsafe(
            `SELECT u.* FROM universities u WHERE u.id IN (${uniIds.map(() => '?').join(',')})`,
            ...uniIds
          ) as Promise<any[]>)
        : Promise.resolve([]),
      catIds.length > 0
        ? (prisma.$queryRawUnsafe(
            `SELECT id, name, slug FROM course_categories WHERE id IN (${catIds.map(() => '?').join(',')})`,
            ...catIds
          ) as Promise<any[]>)
        : Promise.resolve([]),
      specIds.length > 0
        ? (prisma.$queryRawUnsafe(
            `SELECT id, name, slug FROM course_specializations WHERE id IN (${specIds.map(() => '?').join(',')})`,
            ...specIds
          ) as Promise<any[]>)
        : Promise.resolve([]),
    ]);

    // Strip excluded fields from universities
    for (const uni of universities) {
      for (const f of EXCLUDED_UNIVERSITY_FIELDS) {
        delete uni[f];
      }
    }

    const uniMap = new Map(universities.map((u) => [Number(u.id), u]));
    const catMap = new Map(categories.map((c) => [Number(c.id), c]));
    const specMap = new Map(specializations.map((s) => [Number(s.id), s]));

    const formattedItems = programs.map((p) => {
      // Strip excluded fields from program
      for (const f of EXCLUDED_PROGRAM_FIELDS) {
        delete p[f];
      }

      const cat = catMap.get(Number(p.course_category_id)) || null;
      const spec = specMap.get(Number(p.specialization_id)) || null;

      return {
        ...p,
        university: uniMap.get(Number(p.university_id)) || null,
        courseCategory: cat,
        courseSpecialization: spec,
        course_category: cat || p.course_category,
        course_specialization: spec || p.specialization,
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

export const multipleSearchApplyService =
  MultipleSearchApplyService.getInstance();
