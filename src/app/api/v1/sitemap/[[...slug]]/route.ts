import { NextRequest, NextResponse } from 'next/server';
import { sitemapService, withMiddleware, checkApiKey } from '@/backend';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest, { params }: { params: { slug?: string[] } }) => {
  try {
    noStore();
    const slug = params.slug?.[0] || 'index';
    let xml: string;

    switch (slug) {
      case 'index':
        xml = await sitemapService.getIndex();
        break;
      case 'home':
        xml = await sitemapService.getHome();
        break;
      case 'exams':
        xml = await sitemapService.getExams();
        break;
      case 'services':
        xml = await sitemapService.getServices();
        break;
      case 'universities':
        xml = await sitemapService.getUniversities();
        break;
      case 'university':
        xml = await sitemapService.getUniversity();
        break;
      case 'university-program':
        xml = await sitemapService.getUniversityProgram();
        break;
      case 'specialization':
        xml = await sitemapService.getSpecialization();
        break;
      case 'course':
        xml = await sitemapService.getCourse();
        break;
      case 'blog':
        xml = await sitemapService.getBlog();
        break;
      case 'scholarships':
        xml = await sitemapService.getScholarships();
        break;
      case 'course-level':
        xml = await sitemapService.getCourseLevel();
        break;
      case 'courses-in-malaysia':
        xml = await sitemapService.getCoursesInMalaysia();
        break;
      default:
        return NextResponse.json({ message: 'Sitemap not found' }, { status: 404 });
    }

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
});
