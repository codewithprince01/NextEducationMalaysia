import { NextResponse } from 'next/server'
import { sitemapService } from '@/backend/services/sitemap.service'
import { unstable_noStore as noStore } from 'next/cache'

export type SitemapSlug =
  | 'index'
  | 'home'
  | 'exams'
  | 'services'
  | 'universities'
  | 'university'
  | 'university-program'
  | 'specialization'
  | 'course'
  | 'blog'
  | 'course-level'
  | 'courses-in-malaysia'

export async function renderSitemapXml(slug: SitemapSlug): Promise<NextResponse> {
  noStore()
  let xml = ''

  switch (slug) {
    case 'index':
      xml = await sitemapService.getIndex()
      break
    case 'home':
      xml = await sitemapService.getHome()
      break
    case 'exams':
      xml = await sitemapService.getExams()
      break
    case 'services':
      xml = await sitemapService.getServices()
      break
    case 'universities':
      xml = await sitemapService.getUniversities()
      break
    case 'university':
      xml = await sitemapService.getUniversity()
      break
    case 'university-program':
      xml = await sitemapService.getUniversityProgram()
      break
    case 'specialization':
      xml = await sitemapService.getSpecialization()
      break
    case 'course':
      xml = await sitemapService.getCourse()
      break
    case 'blog':
      xml = await sitemapService.getBlog()
      break
    case 'course-level':
      xml = await sitemapService.getCourseLevel()
      break
    case 'courses-in-malaysia':
      xml = await sitemapService.getCoursesInMalaysia()
      break
  }

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
