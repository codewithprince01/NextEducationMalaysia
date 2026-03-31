import { prisma } from '@/lib/db';
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
        'SELECT uri, updated_at FROM exams WHERE status = 1 AND website = ?',
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
        'SELECT uri, updated_at FROM site_pages WHERE status = 1 AND website = ?',
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
        where: { status: 1, website: SITE_VAR as any },
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
      const programs = await prisma.$queryRawUnsafe(`
        SELECT up.slug, up.updated_at, u.uname 
        FROM university_programs up
        JOIN universities u ON up.university_id = u.id
        WHERE up.status = 1
          AND u.status = 1
          AND up.website = ?
          AND u.website = ?
      `, SITE_VAR, SITE_VAR) as any[];

      return programs.map((p) => ({
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
      const specializations = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT cs.id, cs.slug, cs.updated_at
        FROM course_specializations cs
        WHERE cs.slug IS NOT NULL
          AND cs.slug <> ''
          AND cs.website = ?
          AND EXISTS (
            SELECT 1
            FROM specialization_contents sc
            WHERE sc.specialization_id = cs.id
          )
      `, SITE_VAR) as any[];

      const rows: any[] = [];

      for (const spec of specializations) {
        const baseUpdated = this.formatDate(spec.updated_at);
        rows.push({
          endpoint: `specialization/${spec.slug}`,
          updated_at: baseUpdated,
        });

        const levels = await prisma.$queryRawUnsafe(`
          SELECT url_slug, level_slug, updated_at
          FROM specialization_levels
          WHERE specialization_id = ?
        `, Number(spec.id)) as any[];

        for (const level of levels) {
          const slugFromUrl = String(level.url_slug || '').trim();
          const slugFromLevel = String(level.level_slug || '').trim();
          const fallbackSlug = slugFromLevel
            ? `${this.toSeoSlug(slugFromLevel)}-in-${this.toSeoSlug(spec.slug)}`
            : '';
          const levelSlug = slugFromUrl || fallbackSlug;
          if (!levelSlug) continue;

          rows.push({
            endpoint: `specialization/${spec.slug}/${levelSlug}`,
            updated_at: this.formatDate(level.updated_at || spec.updated_at),
          });
        }
      }

      return rows;
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
        'SELECT id, category_slug, updated_at FROM blog_categories WHERE status = 1 AND website = ?',
        SITE_VAR
      ) as any[];
      const rows: any[] = [];
      
      for (const cat of categories) {
        rows.push({ endpoint: `blog/${cat.category_slug}`, updated_at: this.formatDate(cat.updated_at) });
        
        const blogs = await prisma.$queryRawUnsafe(
          'SELECT slug, id, updated_at FROM blogs WHERE category_id = ? AND status = 1 AND website = ?',
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
