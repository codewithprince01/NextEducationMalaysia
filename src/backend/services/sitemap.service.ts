import { sitemapDataService } from './sitemap-data.service';
import { SITE_URL } from '@/lib/constants';

/**
 * Enterprise Sitemap Service (Singleton)
 */
export class SitemapService {
  private static instance: SitemapService;
  private baseUrl: string;

  private constructor() {
    const raw = String(process.env.DOMAIN_URL || process.env.NEXT_PUBLIC_SITE_URL || SITE_URL || '').trim();
    let normalized = raw.replace(/\/$/, '');
    try {
      const url = new URL(normalized);
      if (url.hostname.toLowerCase() === 'educationmalaysia.in') {
        url.hostname = 'www.educationmalaysia.in';
      }
      normalized = url.origin;
    } catch {
      normalized = SITE_URL.replace(/\/$/, '');
    }
    this.baseUrl = normalized;
  }

  static getInstance(): SitemapService {
    if (!SitemapService.instance) {
      SitemapService.instance = new SitemapService();
    }
    return SitemapService.instance;
  }

  private xmlHeader() {
    return '<?xml version="1.0" encoding="UTF-8"?>';
  }

  private xmlEscape(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private wrapSitemapIndex(locs: string[]) {
    return `${this.xmlHeader()}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <sitemap>\n    <loc>${this.xmlEscape(loc)}</loc>\n  </sitemap>`).join('\n')}
</sitemapindex>`;
  }

  private wrapUrlSet(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[]) {
    return `${this.xmlHeader()}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${this.xmlEscape(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;
  }

  async getIndex() {
    const data = await sitemapDataService.getSitemapIndex();
    const locs = data.map((d) => `${this.baseUrl}/${d.endpoint}`);
    return this.wrapSitemapIndex(locs);
  }

  async getHome() {
    const data = await sitemapDataService.getHomeData();
    const urls = data.map((d) => ({
      loc: `${this.baseUrl}/${d.endpoint}`,
      lastmod: d.updated_at,
      changefreq: 'always',
      priority: '1',
    }));
    // Add root
    urls.unshift({ loc: `${this.baseUrl}/`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'always', priority: '1' });
    return this.wrapUrlSet(urls);
  }

  async getExams() {
    const data = await sitemapDataService.getExamsData();
    const urls = data.map((d) => ({ loc: `${this.baseUrl}/${d.endpoint}`, lastmod: d.updated_at, changefreq: 'always', priority: '0.5' }));
    urls.unshift({ loc: `${this.baseUrl}/resources/exams`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'always', priority: '0.8' });
    return this.wrapUrlSet(urls);
  }

  async getServices() {
    const data = await sitemapDataService.getServicesData();
    const urls = data.map((d) => ({ loc: `${this.baseUrl}/${d.endpoint}`, lastmod: d.updated_at, changefreq: 'always', priority: '0.5' }));
    urls.unshift({ loc: `${this.baseUrl}/resources/services`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'always', priority: '0.8' });
    return this.wrapUrlSet(urls);
  }

  async getUniversities() {
    const data = [
      { endpoint: 'universities/universities-in-malaysia' },
      { endpoint: 'universities/public-institution-in-malaysia' },
      { endpoint: 'universities/private-institution-in-malaysia' },
      { endpoint: 'universities/foreign-universities-in-malaysia' },
    ];
    const urls = data.map((d) => ({
      loc: `${this.baseUrl}/${d.endpoint}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'always',
      priority: '1',
    }));
    return this.wrapUrlSet(urls);
  }

  async getUniversity() {
    const data = await sitemapDataService.getUniversityData();
    const urls = data.map((d) => {
      const parts = String(d.endpoint || '').split('/').filter(Boolean);
      const isBaseUniversityPage = parts.length === 2 && parts[0] === 'university';
      return {
        loc: `${this.baseUrl}/${d.endpoint}`,
        lastmod: d.updated_at,
        changefreq: 'always',
        priority: isBaseUniversityPage ? '0.8' : '0.5',
      };
    });
    return this.wrapUrlSet(urls);
  }

  async getUniversityProgram() {
    const data = await sitemapDataService.getUniversityProgramData();
    const urls = data.map((d) => ({ loc: `${this.baseUrl}/${d.endpoint}`, lastmod: d.updated_at, changefreq: 'always', priority: '0.5' }));
    return this.wrapUrlSet(urls);
  }

  async getSpecialization() {
    const data = await sitemapDataService.getSpecializationData();
    const urls = data.map((d) => {
      const parts = String(d.endpoint || '').split('/').filter(Boolean);
      const isBaseSpecialization = parts.length === 2 && parts[0] === 'specialization';
      const isLevelSpecialization = parts.length === 3 && parts[0] === 'specialization';

      return {
        loc: `${this.baseUrl}/${d.endpoint}`,
        lastmod: d.updated_at,
        changefreq: 'weekly',
        priority: isBaseSpecialization ? '0.7' : isLevelSpecialization ? '0.6' : '0.5',
      };
    });
    urls.unshift({ loc: `${this.baseUrl}/specialization`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'always', priority: '0.8' });
    return this.wrapUrlSet(urls);
  }

  async getCourse() {
    const data = await sitemapDataService.getCourseData();
    const urls = data.map((d) => ({ loc: `${this.baseUrl}/${d.endpoint}`, lastmod: d.updated_at, changefreq: 'always', priority: '0.5' }));
    return this.wrapUrlSet(urls);
  }

  async getBlog() {
    const data = await sitemapDataService.getBlogData();
    const urls = data.map((d) => ({ loc: `${this.baseUrl}/${d.endpoint}`, lastmod: d.updated_at, changefreq: 'always', priority: d.endpoint.split('/').length > 2 ? '0.5' : '0.8' }));
    urls.unshift({ loc: `${this.baseUrl}/blog`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'always', priority: '1' });
    return this.wrapUrlSet(urls);
  }

  async getScholarships() {
    const data = await sitemapDataService.getScholarshipsData();
    const urls = data.map((d) => ({
      loc: `${this.baseUrl}/${d.endpoint}`,
      lastmod: d.updated_at,
      changefreq: 'always',
      priority: '0.5',
    }));
    urls.unshift({
      loc: `${this.baseUrl}/scholarships`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'always',
      priority: '0.8',
    });
    return this.wrapUrlSet(urls);
  }

  async getCourseLevel() {
    const levels = ['certificate', 'pre-university', 'diploma', 'under-graduate', 'post-graduate', 'phd'];
    const urls = levels.map((l) => ({ loc: `${this.baseUrl}/courses/${l}`, changefreq: 'always', priority: '0.5' }));
    return this.wrapUrlSet(urls);
  }

  async getCoursesInMalaysia() {
    const data = await sitemapDataService.getCoursesInMalaysiaData();
    const urls = data.map((d) => ({ loc: `${this.baseUrl}/${d.endpoint}`, lastmod: d.updated_at, changefreq: 'always', priority: '0.8' }));
    urls.unshift({ loc: `${this.baseUrl}/courses-in-malaysia`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'always', priority: '0.8' });
    return this.wrapUrlSet(urls);
  }
}

export const sitemapService = SitemapService.getInstance();
