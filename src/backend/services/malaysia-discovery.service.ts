import { prisma } from '@/lib/db-fresh';
import { resolveSeoMeta } from './seo.service';
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
    study_mode?: string;
    intake?: string;
    search?: string;
    page?: number;
  }) {
    const { level, category, specialization, study_mode, intake, search, page = 1 } = params;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    // Resolve slug → model records for filters
    const [curLevel, curCat, curSpc] = await Promise.all([
      level ? prisma.level.findFirst({ where: { slug: level } }) : null,
      category ? prisma.courseCategory.findFirst({ where: { slug: category } }) : null,
      specialization ? prisma.courseSpecialization.findFirst({ where: { slug: specialization } }) : null
    ]);

    // ── Raw SQL for programs (avoids ALL Prisma type mismatches) ────────────
    let baseSqlWhere = `up.status = 1 AND up.website = ? AND u.status = 1`;
    const baseArgs: any[] = [SITE_VAR];

    if (search) { baseSqlWhere += ' AND u.name LIKE ?'; baseArgs.push(`%${search}%`); }
    if (curLevel) { baseSqlWhere += ' AND up.level = ?'; baseArgs.push(curLevel.level); }
    if (curCat) { baseSqlWhere += ' AND up.course_category_id = ?'; baseArgs.push(curCat.id); }
    if (curSpc) { baseSqlWhere += ' AND up.specialization_id = ?'; baseArgs.push(curSpc.id); }
    if (study_mode) { baseSqlWhere += ' AND up.study_mode LIKE ?'; baseArgs.push(`%${study_mode}%`); }
    if (intake) { baseSqlWhere += ' AND up.intake LIKE ?'; baseArgs.push(`%${intake}%`); }

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
      levelsRaw,
      categoriesRaw,
      specializationsRaw,
      studyModesRaw,
      monthsRaw
    ] = await Promise.all([
      prisma.$queryRawUnsafe(programsSql, ...baseArgs, perPage, skip),
      prisma.$queryRawUnsafe(countSql, ...baseArgs),
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
              course_category_id: curCat?.id || undefined,
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

    // Count unique universities for SEO stats
    const nou = new Set((rawPrograms as any[]).map((r: any) => r.u_id)).size;

    // SEO
    const pageContentKeyword = curLevel?.level || curCat?.name || curSpc?.name || 'courses';
    const seo = await resolveSeoMeta('courses-in-malaysia', {
      title: pageContentKeyword,
      currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
      currentyear: new Date().getFullYear().toString(),
      nou: nou.toString(),
      noc: total.toString()
    });

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
        study_mode,
        intake
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

    if (type === 'category') {
      row = await prisma.courseCategory.findUnique({
        where: { id: numericId },
        select: { description: true }
      });
    } else if (type === 'specialization') {
      row = await prisma.courseSpecialization.findUnique({
        where: { id: numericId },
        select: { description: true }
      });
    } else {
      row = await prisma.level.findUnique({
        where: { id: numericId },
        select: { description: true }
      });
    }

    if (!row?.description) return { coursesDescription: '' };

    let desc = row.description;
    desc = desc.replace(/\[nou\]/g, stats.nou).replace(/\[noc\]/g, stats.noc);

    return { coursesDescription: desc };
  }
}

export const malaysiaDiscoveryService = MalaysiaDiscoveryService.getInstance();
