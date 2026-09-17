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
   *
   * NOTE: website filter is optional (via filters.country); no hardcoded website condition.
   * Hidden fields: all fee columns, meta_title, meta_description, meta_keyword,
   *                og_image_path, page_content (programs & nested university).
   */
  /**
   * 6. GET /programs
   * Match: UniversityProgram::with(['university', 'courseCategory', 'courseSpecialization'])
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

    if (filters.country || filters.website) {
      whereClauses.push('up.website = ?');
      params.push(filters.country || filters.website);
    }
    if (filters.university_id) {
      whereClauses.push('up.university_id = ?');
      params.push(Number(filters.university_id));
    }
    if (filters.level) {
      whereClauses.push('up.level = ?');
      params.push(filters.level);
    }
    if (filters.course_category_id) {
      whereClauses.push('up.course_category_id = ?');
      params.push(Number(filters.course_category_id));
    }
    if (filters.specialization_id) {
      whereClauses.push('up.specialization_id = ?');
      params.push(Number(filters.specialization_id));
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

    const FEE_FIELDS_ORDER = [
      'fee_type',
      'fee_number',
      'feefilename',
      'feefilepath',
      'fees_remark',
      'currency',
      'application_fee',
      'application_fees',
      'registration_fee',
      'admin_fee',
      'viza_fee',
      'emgs_processing_fee',
      'medical_insurance_fee',
      'insurance_fee',
      'personal_bond_fee',
      'library_fee',
      'icard_fee',
      'examination_fee',
      'laboratory_fee',
      'technology_fee',
      'student_activity_fee',
      'resources_fee',
      'facilities_fee',
      'commitment_fee',
      'international_student_fee',
      'international_student_fees',
      'international_student_charge',
      'international_administration_fee',
      'international_security_deposit',
      'accommodation_fee',
      'airport_pickup_fee',
      'other_fee',
      'other_fees',
      'discount',
      'domestic_discount',
      'international_discount',
      'saarc_discount',
      'nri_discount',
      'commission',
      'avrg_tution_fees_per_year',
      'avrg_cost_living_per_year',
      // Local Fees
      'total_fee_local',
      'total_tuition_fee_local',
      'anual_tuition_fee_local',
      'annual_tuition_fee_local',
      'year1_tuition_fee_local',
      'year2_tuition_fee_local',
      'year3_tuition_fee_local',
      'year4_tuition_fee_local',
      'scholarship_amount_local',
      'tution_fee_after_scholarship_local',
      // International Fees
      'total_fee_international',
      'total_tuition_fee_international',
      'annual_tuition_fee_international',
      'year1_tuition_fee_international',
      'year2_tuition_fee_international',
      'year3_tuition_fee_international',
      'year4_tuition_fee_international',
      'scholarship_amount_international',
      'tution_fee_after_scholarship_international',
    ];

    const feeSet = new Set(FEE_FIELDS_ORDER);
    const excludedSet = new Set(EXCLUDED_PROGRAM_FIELDS);

    const formattedItems = programs.map((p) => {
      const organizedProg: any = {};

      // 1. General & basic course fields first (non-fee, non-excluded)
      for (const [key, value] of Object.entries(p)) {
        if (!excludedSet.has(key) && !feeSet.has(key)) {
          organizedProg[key] = value;
        }
      }

      // 2. All fee fields placed together in contiguous block
      for (const feeKey of FEE_FIELDS_ORDER) {
        if (feeKey in p && !excludedSet.has(feeKey)) {
          organizedProg[feeKey] = p[feeKey];
        }
      }

      // 3. Fallback for any remaining unexcluded field
      for (const [key, value] of Object.entries(p)) {
        if (!excludedSet.has(key) && !(key in organizedProg)) {
          organizedProg[key] = value;
        }
      }

      const cat = catMap.get(Number(p.course_category_id)) || null;
      const spec = specMap.get(Number(p.specialization_id)) || null;

      // 4. Attached relations
      organizedProg.university = uniMap.get(Number(p.university_id)) || null;
      organizedProg.courseCategory = cat;
      organizedProg.courseSpecialization = spec;
      organizedProg.course_category = cat || p.course_category;
      organizedProg.course_specialization = spec || p.specialization;

      return organizedProg;
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
