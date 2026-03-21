import { prisma } from '@/lib/db-fresh';
import { resolveDetailPageSeo, resolveSeoMeta } from './seo.service';
import { serializeBigInt } from '@/lib/utils';
import { SITE_VAR } from '../utils/constants';

/**
 * Enterprise Malaysia Discovery Service (Singleton)
 */
export class MalaysiaDiscoveryService {
  private static instance: MalaysiaDiscoveryService;

  private constructor() {}

  static getInstance(): MalaysiaDiscoveryService {
    if (!MalaysiaDiscoveryService.instance) {
      MalaysiaDiscoveryService.instance = new MalaysiaDiscoveryService();
    }
    return MalaysiaDiscoveryService.instance;
  }

  /**
   * Fetch courses in Malaysia with filters and sidebar data.
   * Uses $queryRawUnsafe for the main programs query to bypass
   * Prisma type-mismatch errors (tution_fee, rating stored as int).
   */
  async getCoursesInMalaysia(params: {
    level?: string;
    category?: string;
    specialization?: string;
    study_mode?: string | string[];
    intake?: string | string[];
    search?: string;
    page?: number;
  }) {
    const { level, category, specialization, study_mode, intake, search, page = 1 } = params;
    const perPage = 10;
    const skip = (page - 1) * perPage;
    // Resolve slug/name -> model records for filters (tolerant matching like old project)
    const normalizedLevel = level ? String(level).toLowerCase().trim() : '';
    const normalizedCategory = category ? String(category).toLowerCase().trim() : '';
    const normalizedSpecialization = specialization ? String(specialization).toLowerCase().trim() : '';

    const [curLevelRows, curCatRows, curSpcRows] = await Promise.all([
      normalizedLevel
        ? prisma.$queryRawUnsafe(
            `SELECT id, level, slug
             FROM levels
             WHERE slug = ?
                OR LOWER(REPLACE(level, ' ', '-')) = ?
             LIMIT 1`,
            normalizedLevel,
            normalizedLevel
          )
        : Promise.resolve([]),
      normalizedCategory
        ? prisma.$queryRawUnsafe(
            `SELECT id, name, slug
             FROM course_categories
             WHERE slug = ?
                OR LOWER(REPLACE(name, ' ', '-')) = ?
             LIMIT 1`,
            normalizedCategory,
            normalizedCategory
          )
        : Promise.resolve([]),
      normalizedSpecialization
        ? prisma.$queryRawUnsafe(
            `SELECT id, name, slug
             FROM course_specializations
             WHERE slug = ?
                OR LOWER(REPLACE(name, ' ', '-')) = ?
             LIMIT 1`,
            normalizedSpecialization,
            normalizedSpecialization
          )
        : Promise.resolve([])
    ]);

    const curLevel: any = Array.isArray(curLevelRows) && curLevelRows.length > 0 ? (curLevelRows as any[])[0] : null;
    const curCat: any = Array.isArray(curCatRows) && curCatRows.length > 0 ? (curCatRows as any[])[0] : null;
    const curSpc: any = Array.isArray(curSpcRows) && curSpcRows.length > 0 ? (curSpcRows as any[])[0] : null;

    // ── Raw SQL for programs (avoids ALL Prisma type mismatches) ────────────
    let baseSqlWhere = `up.status = 1 AND up.website = ? AND u.status = 1`;
    const baseArgs: any[] = [SITE_VAR];

    const curCatId = curCat?.id != null ? Number(curCat.id) : undefined;
    const curSpcId = curSpc?.id != null ? Number(curSpc.id) : undefined;
    // Category/Specialization SEO rows have their own meta in old project;
    // use them as primary source when current filter resolves successfully.
    let seoSourceModel: any = null;
    try {
      if (curSpcId != null && !Number.isNaN(curSpcId)) {
        seoSourceModel = await prisma.courseSpecialization.findUnique({
          where: { id: curSpcId },
          select: {
            name: true,
            meta_title: true,
            meta_keyword: true,
            meta_description: true,
            page_content: true,
            courses_description: true,
            content_image_path: true,
            og_image_path: true,
          },
        });
      } else if (curCatId != null && !Number.isNaN(curCatId)) {
        seoSourceModel = await prisma.courseCategory.findUnique({
          where: { id: curCatId },
          select: {
            name: true,
            meta_title: true,
            meta_keyword: true,
            meta_description: true,
            page_content: true,
            courses_description: true,
            content_image_path: true,
            og_image_path: true,
          },
        });
      }
    } catch {
      seoSourceModel = null;
    }

    if (search) { baseSqlWhere += ' AND u.name LIKE ?'; baseArgs.push(`%${search}%`); }
    if (curLevel) { baseSqlWhere += ' AND up.level = ?'; baseArgs.push(curLevel.level); }
    if (curCatId != null && !Number.isNaN(curCatId)) { baseSqlWhere += ' AND up.course_category_id = ?'; baseArgs.push(curCatId); }
    if (curSpcId != null && !Number.isNaN(curSpcId)) { baseSqlWhere += ' AND up.specialization_id = ?'; baseArgs.push(curSpcId); }
    const selectedStudyModes = Array.isArray(study_mode)
      ? study_mode.filter(Boolean)
      : study_mode
        ? [study_mode]
        : [];
    const selectedIntakes = Array.isArray(intake)
      ? intake.filter(Boolean)
      : intake
        ? [intake]
        : [];

    if (selectedStudyModes.length > 0) {
      const modeClauses = selectedStudyModes.map(() => 'up.study_mode LIKE ?').join(' OR ');
      baseSqlWhere += ` AND (${modeClauses})`;
      selectedStudyModes.forEach((mode) => baseArgs.push(`%${mode}%`));
    }

    if (selectedIntakes.length > 0) {
      const intakeClauses = selectedIntakes.map(() => 'up.intake LIKE ?').join(' OR ');
      baseSqlWhere += ` AND (${intakeClauses})`;
      selectedIntakes.forEach((month) => baseArgs.push(`%${month}%`));
    }

    const programsSql = `
      SELECT 
        up.id, up.course_name, up.slug, up.level, up.duration,
        up.study_mode, up.intake, up.tution_fee, up.accreditations,
        up.course_category_id, up.specialization_id,
        u.id AS u_id, u.name AS u_name, u.uname AS u_uname,
        u.logo_path AS u_logo_path, u.banner_path AS u_banner_path,
        u.city AS u_city, u.state AS u_state, u.institute_type AS u_institute_type,
        it.type AS u_inst_type_label,
        (SELECT COUNT(*) FROM university_programs p2 WHERE p2.university_id = u.id AND p2.status = 1) AS u_programs_count,
        cc.name AS category_name, cc.slug AS category_slug,
        cs.name AS spec_name, cs.slug AS spec_slug
      FROM university_programs up
      INNER JOIN universities u ON up.university_id = u.id
      LEFT JOIN institute_types it ON u.institute_type = it.id
      LEFT JOIN course_categories cc ON up.course_category_id = cc.id
      LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
      WHERE ${baseSqlWhere}
      ORDER BY up.id DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM university_programs up
      INNER JOIN universities u ON up.university_id = u.id
      WHERE ${baseSqlWhere}
    `;

    const [
      rawPrograms,
      countResult,
      universityCountResult,
      levelsRaw,
      categoriesRaw,
      specializationsRaw,
      studyModesRaw,
      monthsRaw
    ] = await Promise.all([
      prisma.$queryRawUnsafe(programsSql, ...baseArgs, perPage, skip),
      prisma.$queryRawUnsafe(countSql, ...baseArgs),
      prisma.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT u.id) AS total_universities
        FROM university_programs up
        INNER JOIN universities u ON up.university_id = u.id
        WHERE ${baseSqlWhere}
      `, ...baseArgs),
      prisma.level.findMany({
        select: { id: true, level: true, slug: true },
        orderBy: { id: 'asc' }
      }),
      prisma.courseCategory.findMany({
        where: {
          programs: {
            some: {
              status: 1,
              website: SITE_VAR,
              level: curLevel?.level || undefined,
              specialization_id: curSpcId != null && !Number.isNaN(curSpcId) ? curSpcId : undefined,
              university: { status: 1 }
            }
          }
        },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      prisma.courseSpecialization.findMany({
        where: {
          programs: {
            some: {
              status: 1,
              website: SITE_VAR,
              level: curLevel?.level || undefined,
              course_category_id: curCatId != null && !Number.isNaN(curCatId) ? curCatId : undefined,
              university: { status: 1 }
            }
          }
        },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      prisma.$queryRawUnsafe('SELECT * FROM study_modes ORDER BY study_mode ASC'),
      prisma.$queryRawUnsafe('SELECT * FROM months ORDER BY id ASC')
    ]);

    const total = Number((countResult as any[])[0]?.total ?? 0);

    // Reshape raw rows into the shape CourseCard expects
    const programsRaw = (rawPrograms as any[]).map(r => ({
      id: Number(r.id),
      course_name: r.course_name,
      slug: r.slug,
      level: r.level,
      duration: r.duration,
      study_mode: r.study_mode,
      intake: r.intake,
      tution_fee: r.tution_fee != null ? String(r.tution_fee) : null,
      accreditations: r.accreditations,
      university: {
        id: Number(r.u_id),
        name: r.u_name,
        uname: r.u_uname,
        logo_path: r.u_logo_path,
        banner_path: r.u_banner_path,
        city: r.u_city,
        state: r.u_state,
        institute_type: r.u_institute_type,
        inst_type: r.u_inst_type_label,
        programs_count: Number(r.u_programs_count ?? 0),
      },
      courseCategory: r.category_name ? { name: r.category_name, slug: r.category_slug } : null,
      courseSpecialization: r.spec_name ? { name: r.spec_name, slug: r.spec_slug } : null,
    }));

    // Serialize BigInt values
    const [programs, levels, categories, specializations, studyModes, months] = serializeBigInt([
      programsRaw, levelsRaw, categoriesRaw, specializationsRaw, studyModesRaw, monthsRaw
    ]);

    // Count unique universities for SEO stats (across full filtered result, not just current page)
    const nou = Number((universityCountResult as any[])[0]?.total_universities ?? 0);

    // SEO
    const pageContentKeyword = curSpc?.name || curCat?.name || curLevel?.level || 'courses';
    const seoTags = {
      title: pageContentKeyword,
      currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
      currentyear: new Date().getFullYear().toString(),
      nou: nou.toString(),
      noc: total.toString()
    };
    const defaultSeo = await resolveSeoMeta('courses-in-malaysia', seoTags);
    const detailSeoKey = curSpc
      ? 'courses-in-malaysia-by-specialization'
      : curCat
        ? 'courses-in-malaysia-by-category'
        : curLevel
          ? 'courses-in-malaysia-by-level'
          : null;
    const seoModel = seoSourceModel
      ? {
          ...seoSourceModel,
          page_content: seoSourceModel.page_content || seoSourceModel.courses_description || null,
          og_image_path: seoSourceModel.content_image_path || seoSourceModel.og_image_path || null,
        }
      : null;
    const detailSeo = detailSeoKey
      ? await resolveDetailPageSeo(seoModel, detailSeoKey, seoTags)
      : null;
    const seo = detailSeo?.meta_title ? detailSeo : defaultSeo;

    return {
      rows: {
        data: programs,
        total,
        current_page: page,
        per_page: perPage,
        last_page: Math.ceil(total / perPage)
      },
      filters: {
        levels,
        categories,
        specializations,
        study_modes: studyModes,
        intakes: months
      },
      current_filters: {
        level: curLevel?.level || '',
        category: curCat ? { id: curCat.id.toString(), name: curCat.name, slug: curCat.slug } : null,
        specialization: curSpc ? { id: curSpc.id.toString(), name: curSpc.name, slug: curSpc.slug } : null,
        study_mode: selectedStudyModes,
        intake: selectedIntakes
      },
      seo,
      nou,
      noc: total
    };
  }

  /**
   * Get specific content module description.
   */
  async getContentDescription(type: 'category' | 'specialization' | 'level', id: string, stats: { nou: string; noc: string }) {
    let row: any;
    const numericId = Number(id);

    try {
      if (type === 'category') {
        row = await prisma.courseCategory.findUnique({
          where: { id: numericId },
          select: { courses_description: true, page_content: true }
        });
      } else if (type === 'specialization') {
        row = await prisma.courseSpecialization.findUnique({
          where: { id: numericId },
          select: { courses_description: true, page_content: true }
        });
      } else {
        // levels.description does not exist in this DB schema; keep graceful fallback
        row = null;
      }
    } catch {
      row = null;
    }

    const rawDesc = row?.courses_description || row?.page_content || '';
    if (!rawDesc) return { coursesDescription: '' };

    let desc = rawDesc;
    desc = desc.replace(/\[nou\]/g, stats.nou).replace(/\[noc\]/g, stats.noc);

    return { coursesDescription: desc };
  }
}

export const malaysiaDiscoveryService = MalaysiaDiscoveryService.getInstance();




