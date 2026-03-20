import { prisma } from '@/lib/db';

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
    return date.toISOString().split('T')[0];
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
      { endpoint: 'why-study-in-malaysia', updated_at: this.formatDate(null) },
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
      const exams = await prisma.$queryRawUnsafe('SELECT uri, updated_at FROM exams WHERE status = 1') as any[];
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
      const services = await prisma.$queryRawUnsafe('SELECT uri, updated_at FROM site_pages WHERE status = 1') as any[];
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
        where: { status: 1 },
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
        if (hasVideos) rows.push({ endpoint: `university/${uni.uname}/video`, updated_at: updatedAt });
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
        WHERE up.status = 1 AND u.status = 1
      `) as any[];

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
        SELECT DISTINCT s.slug, s.updated_at 
        FROM course_specializations s
        JOIN university_programs up ON up.course_specialization_id = s.id
        WHERE up.status = 1
      `) as any[];

      return specializations.map((s) => ({
        endpoint: `specialization/${s.slug}`,
        updated_at: this.formatDate(s.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching sitemap specializations:', error);
      return [];
    }
  }

  async getCourseData() {
    try {
      const categories = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT c.slug, c.updated_at 
        FROM course_categories c
        JOIN university_programs up ON up.course_category_id = c.id
        WHERE up.status = 1 AND c.status = 1
      `) as any[];

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
      const categories = await prisma.$queryRawUnsafe('SELECT id, category_slug, updated_at FROM blog_categories WHERE status = 1') as any[];
      const rows: any[] = [];
      
      for (const cat of categories) {
        rows.push({ endpoint: `blog/${cat.category_slug}`, updated_at: this.formatDate(cat.updated_at) });
        
        const blogs = await prisma.$queryRawUnsafe('SELECT slug, id, updated_at FROM blogs WHERE category_id = ? AND status = 1', cat.id) as any[];
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
      const levels = await prisma.$queryRawUnsafe('SELECT DISTINCT level, updated_at FROM university_programs WHERE status = 1 AND level IS NOT NULL AND level != ""') as any[];
      const categories = await prisma.$queryRawUnsafe('SELECT DISTINCT slug, updated_at FROM course_categories WHERE status = 1') as any[];
      const specializations = await prisma.$queryRawUnsafe('SELECT DISTINCT slug, updated_at FROM course_specializations WHERE status = 1') as any[];

      const rows: any[] = [];
      const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      for (const l of levels) {
        rows.push({ endpoint: `${slugify(l.level!)}-courses`, updated_at: this.formatDate(l.updated_at) });
      }
      for (const c of categories) {
        rows.push({ endpoint: `${c.slug}-courses`, updated_at: this.formatDate(c.updated_at) });
      }
      for (const s of specializations) {
        rows.push({ endpoint: `${s.slug}-courses`, updated_at: this.formatDate(s.updated_at) });
      }
      return rows;
    } catch (error) {
      console.error('Error fetching sitemap malaysia data:', error);
      return [];
    }
  }
}

export const sitemapDataService = SitemapDataService.getInstance();
