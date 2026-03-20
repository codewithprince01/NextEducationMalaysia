import { prisma } from '@/lib/db-fresh';
import { resolveSeoMeta } from './seo.service';
import { serializeBigInt } from '@/lib/utils';
import { SITE_VAR } from '../utils/constants';

/**
 * Enterprise Discovery Service (Singleton)
 */
export class DiscoveryService {
  private static instance: DiscoveryService;

  private constructor() {}

  static getInstance(): DiscoveryService {
    if (!DiscoveryService.instance) {
      DiscoveryService.instance = new DiscoveryService();
    }
    return DiscoveryService.instance;
  }

  /**
   * List specializations with optional search and category filters.
   */
  async getSpecializations(params: {
    search?: string;
    course_category_id?: string;
    limit?: number;
    orderBy?: string;
    orderIn?: 'asc' | 'desc';
  }) {
    const { search, course_category_id, limit, orderBy = 'name', orderIn = 'asc' } = params;

    try {
      let sql = `
        SELECT
          cs.id,
          cs.name,
          cs.slug,
          cs.icon_class,
          cs.course_category_id,
          cs.website,
          cs.created_at,
          cs.updated_at
        FROM course_specializations cs
        WHERE cs.website = ?
          AND EXISTS (
            SELECT 1
            FROM specialization_contents sc
            WHERE sc.specialization_id = cs.id
          )
      `;
      const args: any[] = [SITE_VAR];

      if (search) {
        sql += ' AND name LIKE ?';
        args.push(`%${search}%`);
      }

      if (course_category_id) {
        sql += ' AND course_category_id = ?';
        args.push(parseInt(course_category_id));
      }

      const safeOrderBy = ['name', 'id', 'created_at', 'updated_at'].includes(orderBy) ? orderBy : 'name';
      const safeOrderIn = orderIn === 'desc' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${safeOrderBy} ${safeOrderIn}`;

      if (limit) {
        sql += ' LIMIT ?';
        args.push(limit);
      }

      const specializations = await prisma.$queryRawUnsafe(sql, ...args);

      const seo = await resolveSeoMeta('specialization', {
        currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
        currentyear: new Date().getFullYear().toString(),
        site: process.env.SITE_URL || ''
      });

      return {
        status: 1,
        data: serializeBigInt(specializations),
        seo
      };
    } catch (error) {
      console.error('Error fetching specializations:', error);
      return { status: 1, data: [], seo: null };
    }
  }

  /**
   * Fetch specialization details by slug or ID.
   */
  async getSpecializationDetail(identifier: string | number, type: 'slug' | 'id' = 'slug') {
    const where: any = { status: 1, contents: { some: {} } };
    if (type === 'slug') where.slug = identifier as string;
    else where.id = parseInt(identifier as string);

    const specialization = await prisma.courseSpecialization.findFirst({
      where,
      include: {
        specializationLevels: true,
        contents: true,
        faqs: true
      }
    });

    if (!specialization) return null;

    // Use raw SQL for programs and related universities to avoid tution_fee mismatch
    const programsRaw: any = await prisma.$queryRawUnsafe(`
      SELECT * FROM university_programs WHERE specialization_id = ? AND status = 1 ORDER BY course_name ASC
    `, specialization.id);

    const [
      relatedUniversities,
      otherSpecializations,
      featuredUniversities,
      dynamicSeo
    ] = await Promise.all([
      prisma.university.findMany({
        where: {
          status: 1,
          programs: { some: { specialization_id: specialization.id } }
        },
        select: {
          id: true,
          name: true,
          uname: true,
          logo_path: true,
          banner_path: true,
          city: true
        }
      }),
      prisma.courseSpecialization.findMany({
        where: { status: 1, contents: { some: {} }, id: { not: specialization.id } },
        select: { id: true, name: true, slug: true },
        take: 10
      }),
      prisma.university.findMany({
        where: { status: 1, featured: 1 },
        select: {
          id: true,
          name: true,
          uname: true,
          logo_path: true,
          banner_path: true,
          city: true
        },
        take: 10
      }),
      resolveSeoMeta('specialization', {
        title: specialization.name || '',
        currentmonth: new Date().toLocaleString('en-US', { month: 'short' }),
        currentyear: new Date().getFullYear().toString(),
        site: process.env.SITE_URL || ''
      })
    ]);

    const universitiesWithCount = await Promise.all(
      relatedUniversities.map(async (u) => {
        const countRes: any = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as total FROM university_programs WHERE specialization_id = ? AND university_id = ? AND status = 1
        `, specialization.id, u.id);
        const count = Number(countRes[0]?.total || 0);
        return { ...u, allspcprograms: count };
      })
    );

    const seo = {
      meta_title: specialization.meta_title || dynamicSeo.meta_title,
      meta_keyword: specialization.meta_keyword || dynamicSeo.meta_keyword,
      meta_description: specialization.meta_description || dynamicSeo.meta_description,
      og_image_path: specialization.og_image_path || dynamicSeo.og_image_path,
      page_content: (specialization as any).page_content || dynamicSeo.page_content,
      seo_rating: (specialization as any).seo_rating?.toString() || dynamicSeo.seo_rating,
      title: specialization.name || ''
    };

    return {
      data: serializeBigInt({
        specialization,
        related_universities: universitiesWithCount,
        other_specializations: otherSpecializations,
        programs: programsRaw.map((p: any) => ({ ...p, tution_fee: p.tution_fee != null ? String(p.tution_fee) : null })),
        featured_universities: featuredUniversities,
      }),
      seo
    };
  }

  /**
   * Fetch specialization level contents.
   */
  async getSpecializationLevelContents(levelId: string | number) {
    const rows = await prisma.specializationLevelContent.findMany({
      where: { specialization_level_id: parseInt(levelId as string) },
      orderBy: { position: 'asc' }
    });

    return {
      status: 1,
      data: serializeBigInt(rows)
    };
  }

  /**
   * Fetch course categories with specialization counts.
   */
  async getCourseCategories() {
    try {
      const categories = await prisma.$queryRawUnsafe(`
        SELECT
          cc.id,
          cc.name,
          cc.slug,
          cc.icon_class,
          cc.thumbnail_path,
          COUNT(DISTINCT cs.id) AS number_of_specialization
        FROM course_categories cc
        LEFT JOIN course_specializations cs
          ON cs.course_category_id = cc.id
         AND cs.website = ?
         AND EXISTS (
           SELECT 1
           FROM specialization_contents sc
           WHERE sc.specialization_id = cs.id
         )
        WHERE cc.website = ?
        GROUP BY cc.id, cc.name, cc.slug, cc.icon_class, cc.thumbnail_path
        HAVING COUNT(DISTINCT cs.id) > 0
        ORDER BY cc.name ASC
      `, SITE_VAR, SITE_VAR) as any[];

      return {
        status: 1,
        data: categories.map((cat: any) => ({
          id: Number(cat.id),
          name: cat.name,
          slug: cat.slug,
          icon_class: cat.icon_class,
          thumbnail_path: cat.thumbnail_path,
          number_of_specialization: Number(cat.number_of_specialization)
        }))
      };
    } catch (error) {
      console.error('Error fetching course categories:', error);
      return { status: 1, data: [] };
    }
  }

  async getCountries() {
    const countries = await prisma.$queryRawUnsafe<any[]>(`
      SELECT up.website, c.name
      FROM university_programs up
      JOIN countries c ON up.website = c.iso3
      WHERE up.status = 1
      GROUP BY up.website, c.name
    `);
    return { status: 1, message: 'Countries fetched successfully', data: serializeBigInt(countries) };
  }

  async getUniversities(website?: string) {
    const whereSql = website ? `WHERE website = ? AND status = 1` : `WHERE status = 1`;
    const args = website ? [website] : [];
    
    // Check for programs with raw SQL to be safe
    const universities = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT u.id, u.name, u.uname 
      FROM universities u
      JOIN university_programs up ON up.university_id = u.id
      ${whereSql} AND up.status = 1
      ORDER BY u.name ASC
    `, ...args);
    
    return { status: 1, message: 'Universities fetched successfully', data: serializeBigInt(universities) };
  }

  async getLevels(universityId: string) {
    const levels = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT level FROM university_programs WHERE university_id = ? AND status = 1
    `, parseInt(universityId));
    return { status: 1, message: 'Levels fetched successfully', data: levels };
  }

  async getCategories(params: { university_id: string; level?: string }) {
    const { university_id, level } = params;
    const args: any[] = [parseInt(university_id)];
    let sql = `
      SELECT DISTINCT cc.id, cc.name, cc.slug
      FROM course_categories cc
      JOIN university_programs up ON up.course_category_id = cc.id
      WHERE up.university_id = ? AND up.status = 1
    `;
    if (level) {
      sql += ` AND up.level = ?`;
      args.push(level);
    }
    sql += ` ORDER BY cc.name ASC`;
    
    const categories = await prisma.$queryRawUnsafe(sql, ...args);
    return { status: 1, message: 'Categories fetched successfully', data: serializeBigInt(categories) };
  }

  async getSearchSpecializations(params: { university_id: string; level?: string; course_category_id?: string }) {
    const { university_id, level, course_category_id } = params;
    const args: any[] = [parseInt(university_id)];
    let sql = `
      SELECT DISTINCT cs.id, cs.name, cs.slug
      FROM course_specializations cs
      JOIN university_programs up ON up.specialization_id = cs.id
      WHERE up.university_id = ? AND up.status = 1
    `;
    if (level) {
      sql += ` AND up.level = ?`;
      args.push(level);
    }
    if (course_category_id) {
      sql += ` AND up.course_category_id = ?`;
      args.push(parseInt(course_category_id));
    }
    sql += ` ORDER BY cs.name ASC`;

    const specializations = await prisma.$queryRawUnsafe(sql, ...args);
    return { status: 1, message: 'Specializations fetched successfully', data: serializeBigInt(specializations) };
  }

  async searchPrograms(params: {
    university_id?: string;
    level?: string;
    course_category_id?: string;
    specialization_id?: string;
    page?: number;
    per_page?: number;
  }) {
    const { page = 1, per_page = 10 } = params;
    const skip = (page - 1) * per_page;

    let whereSql = `WHERE up.status = 1`;
    const args: any[] = [];

    if (params.university_id) { whereSql += ` AND up.university_id = ?`; args.push(parseInt(params.university_id)); }
    if (params.level) { whereSql += ` AND up.level = ?`; args.push(params.level); }
    if (params.course_category_id) { whereSql += ` AND up.course_category_id = ?`; args.push(parseInt(params.course_category_id)); }
    if (params.specialization_id) { whereSql += ` AND up.specialization_id = ?`; args.push(parseInt(params.specialization_id)); }

    const programs: any = await prisma.$queryRawUnsafe(`
      SELECT up.*, 
             u.id as u_id, u.name as u_name, u.uname as u_uname, u.logo_path as u_logo_path,
             cc.name as category_name, cc.slug as category_slug,
             cs.name as spec_name, cs.slug as spec_slug
      FROM university_programs up
      JOIN universities u ON up.university_id = u.id
      LEFT JOIN course_categories cc ON up.course_category_id = cc.id
      LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
      ${whereSql}
      ORDER BY up.id DESC
      LIMIT ${per_page} OFFSET ${skip}
    `, ...args);

    const countRes: any = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM university_programs up ${whereSql}
    `, ...args);

    const total = Number(countRes[0]?.total || 0);

    return {
      status: true,
      message: 'Programs fetched successfully',
      pagination: {
        total,
        current_page: page,
        per_page,
        last_page: Math.ceil(total / per_page)
      },
      data: serializeBigInt(programs.map((p: any) => ({
        ...p,
        tution_fee: p.tution_fee != null ? String(p.tution_fee) : null,
        university: { id: p.u_id, name: p.u_name, uname: p.u_uname, logo_path: p.u_logo_path },
        courseCategory: p.category_name ? { name: p.category_name, slug: p.category_slug } : null,
        courseSpecialization: p.spec_name ? { name: p.spec_name, slug: p.spec_slug } : null
      })))
    };
  }
}

export const discoveryService = DiscoveryService.getInstance();
