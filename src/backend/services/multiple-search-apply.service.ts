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
   * Returns all fields from university_programs table EXCEPT:
   *   - Fee fields (tution_fee, exam_fee, tutions_fee, total_fee, total_tuition_fee,
   *     annual_tuition_fee, scholarship_amount, tution_fee_after_scholarship,
   *     year1-4 tuition fees, and local/international variants)
   *   - SEO fields (meta_title, meta_description, meta_keyword, og_image_path, page_content)
   * And includes nested university with all fields EXCEPT SEO fields.
   */
  async getPrograms(filters: any, page = 1, perPage = 10) {
    const SELECTED_PROGRAM_COLS = [
      'id',
      'course_name',
      'university_id',
      'author_id',
      'u_status',
      'uname',
      'program_id',
      'slug',
      'course_category_id',
      'course_category_slug',
      'specialization_id',
      'specialization_slug',
      'level',
      'duration',
      'study_mode',
      'intake',
      'application_deadline',
      'language',
      'scholarship',
      'overview',
      'status',
      'feefilename',
      'feefilepath',
      'application_fee',
      'viza_fee',
      'international_student_fee',
      'medical_insurance_fee',
      'personal_bond_fee',
      'library_fee',
      'admin_fee',
      'icard_fee',
      'fee_type',
      'fee_number',
      'other_fees',
      'discount',
      'commission',
      'seo_rating',
      'best_rating',
      'review_number',
      'entry_requirement',
      'exam_required',
      'mode_of_instruction',
      'scholarship_info',
      'avrg_tution_fees_per_year',
      'avrg_cost_living_per_year',
      'application_fees',
      'intake_deadline',
      'international_student_fees',
      'fees_remark',
      'domestic_discount',
      'international_discount',
      'saarc_discount',
      'website',
      'nri_discount',
      'registration_fee',
      'laboratory_fee',
      'technology_fee',
      'student_activity_fee',
      'insurance_fee',
      'examination_fee',
      'emgs_processing_fee',
      'international_security_deposit',
      'international_student_charge',
      'international_administration_fee',
      'resources_fee',
      'commitment_fee',
      'facilities_fee',
      'other_fee',
      'last_update',
      'currency',
      'additional_note',
      'accommodation_fee',
      'airport_pickup_fee',
      'campus',
      'accreditations',
      'is_local',
      'is_international',
      'created_at',
      'updated_at',
    ];

    const SELECTED_UNIVERSITY_COLS = [
      'id',
      'name',
      'uname',
      'author_id',
      'website',
      'code',
      'views',
      'state',
      'city',
      'rank',
      'qs_asia_rank',
      'qs_rank',
      'times_rank',
      'shortnote',
      'overview',
      'institute_type',
      'established_year',
      'email',
      'cc',
      'bcc',
      'loginid',
      'mobile',
      'ip',
      'login_count',
      'click',
      'status',
      'homeview',
      'logo_path',
      'banner_path',
      'seo_rating',
      'best_rating',
      'review_number',
      'last_login',
      'ogimgname',
      'ogimgpath',
      'inst_type',
      'imgname',
      'imgpath',
      'bannername',
      'bannerpath',
      'rating',
      'partner',
      'featured',
      'latitude_longitude',
      'approved_by',
      'accredited_by',
      'hostel_facility',
      'malaysia_rank',
      'local_students',
      'international_students',
      'contact_number1',
      'contact_number2',
      'is_local',
      'is_international',
      'scholarship_available',
      'study_options',
      'created_at',
      'updated_at',
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
      SELECT ${SELECTED_PROGRAM_COLS.map((c) => 'up.`' + c + '`').join(', ')}
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
            `SELECT ${SELECTED_UNIVERSITY_COLS.map((c) => 'u.`' + c + '`').join(', ')} FROM universities u WHERE u.id IN (${uniIds.map(() => '?').join(',')})`,
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

    const uniMap = new Map(universities.map((u) => [Number(u.id), u]));
    const catMap = new Map(categories.map((c) => [Number(c.id), c]));
    const specMap = new Map(specializations.map((s) => [Number(s.id), s]));

    const formattedItems = programs.map((p) => ({
      ...p,
      university: uniMap.get(Number(p.university_id)) || null,
      course_category: catMap.get(Number(p.course_category_id)) || null,
      course_specialization: specMap.get(Number(p.specialization_id)) || null,
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
