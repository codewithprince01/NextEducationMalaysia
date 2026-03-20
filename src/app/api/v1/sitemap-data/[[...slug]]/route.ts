import { NextRequest } from 'next/server';
import { sitemapDataService, apiSuccess, apiError, withMiddleware, checkApiKey } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest, { params }: { params: { slug?: string[] } }) => {
  try {
    const slug = params.slug?.[0] || 'index';
    let data: any;
    let message = 'Sitemap data fetched successfully';
    let parent: any[] = [];

    switch (slug) {
      case 'index':
        data = await sitemapDataService.getSitemapIndex();
        break;
      case 'home':
        data = await sitemapDataService.getHomeData();
        parent = [{ endpoint: '', updated_at: new Date().toISOString().split('T')[0] }];
        break;
      case 'exams':
        data = await sitemapDataService.getExamsData();
        parent = [{ endpoint: 'resources/exams', updated_at: new Date().toISOString().split('T')[0] }];
        break;
      case 'services':
        data = await sitemapDataService.getServicesData();
        parent = [{ endpoint: 'resources/services', updated_at: new Date().toISOString().split('T')[0] }];
        break;
      case 'universities':
        data = [
          { endpoint: 'universities/universities-in-malaysia', updated_at: new Date().toISOString().split('T')[0] },
          { endpoint: 'universities/public-institution-in-malaysia', updated_at: new Date().toISOString().split('T')[0] },
          { endpoint: 'universities/private-institution-in-malaysia', updated_at: new Date().toISOString().split('T')[0] },
          { endpoint: 'universities/foreign-universities-in-malaysia', updated_at: new Date().toISOString().split('T')[0] },
        ];
        parent = [{ endpoint: '', updated_at: new Date().toISOString().split('T')[0] }];
        break;
      case 'university':
        data = await sitemapDataService.getUniversityData();
        break;
      case 'university-program':
        data = await sitemapDataService.getUniversityProgramData();
        break;
      case 'specialization':
        data = await sitemapDataService.getSpecializationData();
        parent = [{ endpoint: 'specialization', updated_at: new Date().toISOString().split('T')[0] }];
        break;
      case 'course':
        data = await sitemapDataService.getCourseData();
        break;
      case 'blog':
        data = await sitemapDataService.getBlogData();
        parent = [{ endpoint: 'blog', updated_at: new Date().toISOString().split('T')[0] }];
        break;
      case 'course-level':
        const levels = ['certificate', 'pre-university', 'diploma', 'under-graduate', 'post-graduate', 'phd'];
        data = levels.map((l) => ({ endpoint: `courses/${l}`, updated_at: new Date().toISOString().split('T')[0] }));
        break;
      case 'courses-in-malaysia':
        data = await sitemapDataService.getCoursesInMalaysiaData();
        parent = [{ endpoint: 'courses-in-malaysia', updated_at: new Date().toISOString().split('T')[0] }];
        break;
      default:
        return apiError('Sitemap data not found', 404);
    }

    return apiSuccess(data, message, 200, { parent });
  } catch (error: any) {
    return apiError(error.message);
  }
});
