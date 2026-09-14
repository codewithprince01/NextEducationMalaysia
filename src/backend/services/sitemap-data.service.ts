import { prisma } from '@/lib/db';
import {
  getCourseIndexability,
  getSpecializationIndexability,
  getSpecializationLevelIndexability,
} from '@/lib/seo/indexability'
import { SITE_VAR } from '@/lib/constants';

/**
 * Enterprise Sitemap Data Service (Singleton)
 */
export class SitemapDataService {
  private static instance: SitemapDataService;

  private constructor() {}

  static getInstance(): SitemapDataService {
    if (!SitemapDataService.instance) {
      SitemapDataService.instance = new SitemapDataService();
    }
    return SitemapDataService.instance;
  }

  private formatDate(value: any): string {
    if (!value) return new Date().toISOString().split('T')[0];
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
  }

  private toSeoSlug(value: string): string {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async getSitemapIndex() {
    return [
      { endpoint: 'sitemap-home.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-exams.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-scholarships.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-services.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-universities.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-university.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-university-program.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-specialization.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-course.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-blog.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-course-level.xml', updated_at: this.formatDate(null) },
      { endpoint: 'sitemap-courses-in-malaysia.xml', updated_at: this.formatDate(null) },
    ];
  }

  async getHomeData() {
    return [
      { endpoint: 'who-we-are', updated_at: this.formatDate(null) },
      { endpoint: 'what-people-say', updated_at: this.formatDate(null) },
      { endpoint: 'universities', updated_at: this.formatDate(null) },
      { endpoint: 'contact-us', updated_at: this.formatDate(null) },
      { endpoint: 'terms-and-conditions', updated_at: this.formatDate(null) },
      { endpoint: 'privacy-policy', updated_at: this.formatDate(null) },
      { endpoint: 'faqs', updated_at: this.formatDate(null) },
    ];
  }

  async getExamsData() {
    try {
      const exams = await prisma.$queryRawUnsafe(
        'SELECT uri, updated_at FROM exams WHERE status = 1 AND website = ? AND uri IS NOT NULL AND uri <> ""',
        SITE_VAR
      ) as any[];
      return exams.map((e) => ({
        endpoint: `resources/exams/${e.uri}`,
        updated_at: this.formatDate(e.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching sitemap exams:', error);
      return [];
    }
  }

  async getServicesData() {
    try {
      const services = await prisma.$queryRawUnsafe(
        'SELECT uri, updated_at FROM site_pages WHERE status = 1 AND website = ? AND uri IS NOT NULL AND uri <> ""',
        SITE_VAR
      ) as any[];
      return services.map((s) => ({
        endpoint: `resources/services/${s.uri}`,
        updated_at: this.formatDate(s.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching sitemap services:', error);
      return [];
    }
  }

  async getUniversityData() {
    try {
      const universities = await prisma.university.findMany({
        where: {
          status: 1,
          website: SITE_VAR as any,
          uname: { not: null as any },
          NOT: [{ uname: '' as any }],
        },
        select: { uname: true, updated_at: true, id: true }
      });

      const rows: any[] = [];
      for (const uni of universities) {
        const updatedAt = this.formatDate(uni.updated_at);
        rows.push({ endpoint: `university/${uni.uname}`, updated_at: updatedAt });
        
        // Use raw queries for sub-counts/checks to be safe
        const [hasPhotos, hasVideos, hasReviews, hasPrograms] = await Promise.all([
          prisma.$queryRawUnsafe('SELECT id FROM university_photos WHERE university_id = ? LIMIT 1', uni.id).then(r => (r as any[]).length > 0),
          prisma.$queryRawUnsafe('SELECT id FROM university_videos WHERE university_id = ? LIMIT 1', uni.id).then(r => (r as any[]).length > 0),
          prisma.$queryRawUnsafe('SELECT id FROM reviews WHERE university_id = ? AND status = 1 LIMIT 1', uni.id).then(r => (r as any[]).length > 0),
          prisma.$queryRawUnsafe('SELECT id FROM university_programs WHERE university_id = ? AND status = 1 LIMIT 1', uni.id).then(r => (r as any[]).length > 0)
        ]);

        if (hasPhotos) rows.push({ endpoint: `university/${uni.uname}/gallery`, updated_at: updatedAt });
        if (hasVideos) rows.push({ endpoint: `university/${uni.uname}/videos`, updated_at: updatedAt });
        if (hasReviews) rows.push({ endpoint: `university/${uni.uname}/reviews`, updated_at: updatedAt });
        if (hasPrograms) rows.push({ endpoint: `university/${uni.uname}/courses`, updated_at: updatedAt });
      }
      return rows;
    } catch (error) {
      console.error('Error fetching sitemap universities:', error);
      return [];
    }
  }

  async getUniversityProgramData() {
    try {
      // The quality columns come back with the row so indexability is decided by
      // the same helper the page metadata uses. Duplicating the rule in SQL would
      // let the two drift, and a sitemap that advertises a noindex page wastes
      // precisely the crawl budget this is meant to protect.
      //
      // Prose is truncated because only its length matters here: 4k characters is
      // far more than the threshold needs, and it keeps thousands of LongText
      // bodies out of memory.
      const programs = await prisma.$queryRawUnsafe(`
        SELECT up.id, up.slug, up.updated_at, u.uname,
               LEFT(up.overview, 4000) AS overview,
               LEFT(up.page_content, 4000) AS page_content,
               up.total_tuition_fee, up.annual_tuition_fee, up.tution_fee,
               up.total_fee, up.tutions_fee,
               up.entry_requirement, up.exam_required, up.scholarship_info,
               up.accreditations, up.intake, up.application_deadline,
               up.mode_of_instruction
        FROM university_programs up
        JOIN universities u ON up.university_id = u.id
        WHERE up.status = 1
          AND u.status = 1
          AND up.website = ?
          AND u.website = ?
          AND up.slug IS NOT NULL
          AND up.slug <> ''
          AND u.uname IS NOT NULL
          AND u.uname <> ''
      `, SITE_VAR, SITE_VAR) as any[];

      // A course keeps its write-up in content tabs, so the longest section for
      // each is loaded here and handed to the same check the page metadata runs.
      const courseProse = new Map<number, string>();
      const sections = await prisma.$queryRawUnsafe(`
        SELECT c_id AS owner_id, LEFT(description, 4000) AS body
        FROM university_program_contents
        WHERE status = 1 AND description IS NOT NULL
      `) as any[];

      for (const section of sections) {
        const id = Number(section.owner_id);
        if (!Number.isFinite(id)) continue;
        const body = String(section.body || '');
        if (body.length > (courseProse.get(id) || '').length) courseProse.set(id, body);
      }

      return programs
        .filter((p) => getCourseIndexability(p, [courseProse.get(Number(p.id))]).index)
        .map((p) => ({
          endpoint: `university/${p.uname}/courses/${p.slug}`,
          updated_at: this.formatDate(p.updated_at),
        }));
    } catch (error) {
      console.error('Error fetching sitemap programs:', error);
      return [];
    }
  }

  async getSpecializationData() {
    try {
      const specializationRows = await prisma.$queryRawUnsafe(`
        SELECT
          cs.id,
          cs.slug,
          cs.updated_at,
          cs.avrg_fees, cs.avrg_salary, cs.job_demand, cs.courses_description,
          LEFT(cs.page_content, 4000) AS page_content,
          sl.id AS level_id,
          sl.url_slug AS level_url_slug,
          sl.level_slug AS level_level_slug,
          sl.updated_at AS level_updated_at,
          sl.tuition_fees AS level_tuition_fees,
          sl.intake AS level_intake,
          sl.accreditation AS level_accreditation,
          sl.duration AS level_duration
        FROM course_specializations cs
        LEFT JOIN specialization_levels sl
          ON sl.specialization_id = cs.id
        WHERE cs.slug IS NOT NULL
          AND cs.slug <> ''
          AND cs.website = ?
          -- Both /specialization/<slug> and /specialization/<slug>/<level> render
          -- through getSpecializationBySlug(), which returns null (-> notFound())
          -- unless the specialization has at least one specialization_contents row.
          -- Having a level row is NOT enough, so listing those URLs would publish
          -- 404s in the sitemap.
          AND EXISTS (
            SELECT 1
            FROM specialization_contents sc
            WHERE sc.specialization_id = cs.id
          )
          -- Some slugs are duplicated across several course_specializations rows.
          -- fetchSpecializationDetail() resolves the lowest matching id, so only
          -- that row's levels are reachable; emitting the other rows' levels would
          -- publish 404s.
          AND cs.id = (
            SELECT MIN(cs2.id)
            FROM course_specializations cs2
            WHERE cs2.slug = cs.slug
              AND cs2.website = cs.website
              AND EXISTS (
                SELECT 1
                FROM specialization_contents sc2
                WHERE sc2.specialization_id = cs2.id
              )
          )
        ORDER BY cs.id ASC
      `, SITE_VAR) as any[];

      // Prose lives in child rows for both the hub page and its levels, so the
      // longest section for each owner is loaded once here. Indexability is then
      // decided by the same helpers the page metadata uses, so a URL can never be
      // advertised in the sitemap while its page says noindex.
      const specProse = new Map<number, string>();
      const levelProse = new Map<number, string>();

      const [specSections, levelSections] = await Promise.all([
        prisma.$queryRawUnsafe(`
          SELECT specialization_id AS owner_id, LEFT(description, 4000) AS body
          FROM specialization_contents WHERE description IS NOT NULL
        `) as Promise<any[]>,
        prisma.$queryRawUnsafe(`
          SELECT specialization_level_id AS owner_id, LEFT(description, 4000) AS body
          FROM specialization_level_contents WHERE description IS NOT NULL
        `) as Promise<any[]>,
      ]);

      const keepLongest = (target: Map<number, string>, rows: any[]) => {
        for (const row of rows) {
          const id = Number(row.owner_id);
          if (!Number.isFinite(id)) continue;
          const body = String(row.body || '');
          if (body.length > (target.get(id) || '').length) target.set(id, body);
        }
      };
      keepLongest(specProse, specSections);
      keepLongest(levelProse, levelSections);

      const rowsMap = new Map<string, string>();

      for (const row of specializationRows) {
        const specSlug = String(row.slug || '').trim();
        if (!specSlug) continue;

        const baseEndpoint = `specialization/${specSlug}`;
        if (!rowsMap.has(baseEndpoint) && getSpecializationIndexability(row, [specProse.get(Number(row.id))]).index) {
          rowsMap.set(baseEndpoint, this.formatDate(row.updated_at));
        }

        const slugFromUrl = String(row.level_url_slug || '').trim();
        const slugFromLevel = String(row.level_level_slug || '').trim();
        const fallbackSlug = slugFromLevel
          ? `${this.toSeoSlug(slugFromLevel)}-in-${this.toSeoSlug(specSlug)}`
          : '';
        const levelSlug = slugFromUrl || fallbackSlug;
        if (!levelSlug) continue;

        // A level is judged on its own body, which is written per level and is
        // almost always distinct — frequently richer than the hub above it.
        const level = {
          tuition_fees: row.level_tuition_fees,
          intake: row.level_intake,
          accreditation: row.level_accreditation,
          duration: row.level_duration,
        };
        const levelEndpoint = `specialization/${specSlug}/${levelSlug}`;
        if (
          !rowsMap.has(levelEndpoint) &&
          getSpecializationLevelIndexability(level, [levelProse.get(Number(row.level_id))]).index
        ) {
          rowsMap.set(levelEndpoint, this.formatDate(row.level_updated_at || row.updated_at));
        }
      }

      return Array.from(rowsMap.entries()).map(([endpoint, updated_at]) => ({ endpoint, updated_at }));
    } catch (error) {
      console.error('Error fetching sitemap specializations:', error);
      return [];
    }
  }

  async getCourseData() {
    try {
      const categories = await prisma.$queryRawUnsafe(`
        SELECT c.slug, c.updated_at
        FROM course_categories c
        WHERE c.slug IS NOT NULL
          AND c.slug <> ''
          AND c.website = ?
          AND EXISTS (
            SELECT 1
            FROM course_category_contents ccc
            WHERE ccc.course_category_id = c.id
          )
      `, SITE_VAR) as any[];

      return categories.map((c) => ({
        endpoint: `course/${c.slug}`,
        updated_at: this.formatDate(c.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching sitemap courses:', error);
      return [];
    }
  }

  async getBlogData() {
    try {
      const categories = await prisma.$queryRawUnsafe(
        'SELECT id, category_slug, updated_at FROM blog_categories WHERE status = 1 AND website = ? AND category_slug IS NOT NULL AND category_slug <> ""',
        SITE_VAR
      ) as any[];
      const rows: any[] = [];
      
      for (const cat of categories) {
        rows.push({ endpoint: `blog/${cat.category_slug}`, updated_at: this.formatDate(cat.updated_at) });
        
        const blogs = await prisma.$queryRawUnsafe(
          'SELECT slug, id, updated_at FROM blogs WHERE category_id = ? AND status = 1 AND website = ? AND slug IS NOT NULL AND slug <> ""',
          cat.id,
          SITE_VAR
        ) as any[];
        for (const blog of blogs) {
          rows.push({
            endpoint: `blog/${cat.category_slug}/${blog.slug}-${blog.id}`,
            updated_at: this.formatDate(blog.updated_at),
          });
        }
      }
      return rows;
    } catch (error) {
      console.error('Error fetching sitemap blogs:', error);
      return [];
    }
  }

  async getScholarshipsData() {
    try {
      const scholarships = await prisma.$queryRawUnsafe(
        `SELECT slug, updated_at
         FROM scholarships
         WHERE status = 1
           AND website = ?
           AND slug IS NOT NULL
           AND slug <> ''`,
        SITE_VAR
      ) as any[];

      return scholarships.map((s) => ({
        endpoint: `scholarships/${s.slug}`,
        updated_at: this.formatDate(s.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching sitemap scholarships:', error);
      return [];
    }
  }

  async getCoursesInMalaysiaData() {
    try {
      const levels = await prisma.$queryRawUnsafe(
        'SELECT DISTINCT level, updated_at FROM university_programs WHERE status = 1 AND website = ? AND level IS NOT NULL AND level != ""',
        SITE_VAR
      ) as any[];
      const categories = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT cc.slug, cc.updated_at
        FROM course_categories cc
        WHERE cc.slug IS NOT NULL
          AND cc.slug <> ''
          AND cc.website = ?
          AND EXISTS (
            SELECT 1
            FROM university_programs up
            WHERE up.course_category_id = cc.id
              AND up.status = 1
              AND up.website = ?
          )
      `, SITE_VAR, SITE_VAR) as any[];
      const specializations = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT cs.slug, cs.updated_at
        FROM course_specializations cs
        WHERE cs.slug IS NOT NULL
          AND cs.slug <> ''
          AND cs.website = ?
          AND EXISTS (
            SELECT 1
            FROM university_programs up
            WHERE up.specialization_id = cs.id
              AND up.status = 1
              AND up.website = ?
          )
      `, SITE_VAR, SITE_VAR) as any[];

      const rowsMap = new Map<string, string>();
      const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      for (const l of levels) {
        const endpoint = `${slugify(l.level!)}-courses`;
        rowsMap.set(endpoint, this.formatDate(l.updated_at));
      }
      for (const c of categories) {
        const endpoint = `${c.slug}-courses`;
        rowsMap.set(endpoint, this.formatDate(c.updated_at));
      }
      for (const s of specializations) {
        const endpoint = `${s.slug}-courses`;
        rowsMap.set(endpoint, this.formatDate(s.updated_at));
      }
      return Array.from(rowsMap.entries()).map(([endpoint, updated_at]) => ({ endpoint, updated_at }));
    } catch (error) {
      console.error('Error fetching sitemap malaysia data:', error);
      return [];
    }
  }
}

export const sitemapDataService = SitemapDataService.getInstance();
