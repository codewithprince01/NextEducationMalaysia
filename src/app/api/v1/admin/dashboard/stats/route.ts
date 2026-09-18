import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/bigint';

export async function GET() {
  try {
    const [
      universitiesCount,
      activeUniversitiesCount,
      featuredUniversitiesCount,
      scholarshipUnisCount,
      programsCount,
      blogsCount,
      blogCategoriesCount,
      categoriesCount,
      specializationsCount,
      levelsCount,
      malaysiaApps,
      internationalApps,
      usersCount,
      servicesCount,
      examsCount,
      faqsCount,
      scholarshipsCount,
      recentUniversities,
      recentBlogs,
    ] = await Promise.all([
      prisma.university.count().catch(() => 0),
      prisma.university.count({ where: { status: 1 } }).catch(() => 0),
      prisma.university.count({ where: { featured: 1 } }).catch(() => 0),
      prisma.university.count({ where: { scholarship_available: 1 } }).catch(() => 0),
      prisma.universityProgram.count().catch(() => 0),
      prisma.blog.count().catch(() => 0),
      prisma.blogCategory.count().catch(() => 0),
      prisma.courseCategory.count().catch(() => 0),
      prisma.courseSpecialization.count().catch(() => 0),
      prisma.level.count().catch(() => 0),
      prisma.malaysiaApplication.aggregate({ _sum: { count: true } }).catch(() => ({ _sum: { count: 0 } })),
      prisma.internationalStudentData.aggregate({ _sum: { count: true } }).catch(() => ({ _sum: { count: 0 } })),
      prisma.user.count().catch(() => 0),
      prisma.service.count().catch(() => 0),
      prisma.exam.count().catch(() => 0),
      prisma.faq.count().catch(() => 0),
      prisma.scholarship.count().catch(() => 0),
      prisma.university.findMany({
        take: 6,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          name: true,
          uname: true,
          city: true,
          state: true,
          qs_rank: true,
          rating: true,
          logo_path: true,
          status: true,
          created_at: true,
        },
      }).catch(() => []),
      prisma.blog.findMany({
        take: 6,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail_path: true,
          status: true,
          created_at: true,
          category: {
            select: {
              category_name: true,
            },
          },
        },
      }).catch(() => []),
    ]);

    let testimonialsCount = 0;
    try {
      const [tRes]: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM testimonials`);
      testimonialsCount = Number(tRes?.count || 0);
    } catch {
      testimonialsCount = 0;
    }

    const totalMalaysiaApps = Number(malaysiaApps?._sum?.count || 0);
    const totalInternationalApps = Number(internationalApps?._sum?.count || 0);
    const totalApplications = totalMalaysiaApps + totalInternationalApps;

    return NextResponse.json({
      success: true,
      data: serializeBigInt({
        universities: universitiesCount,
        activeUniversities: activeUniversitiesCount,
        featuredUniversities: featuredUniversitiesCount,
        scholarshipUniversities: scholarshipUnisCount,
        programs: programsCount,
        blogs: blogsCount,
        blogCategories: blogCategoriesCount,
        categories: categoriesCount,
        specializations: specializationsCount,
        levels: levelsCount,
        applications: totalApplications,
        malaysiaApplications: totalMalaysiaApps,
        internationalApplications: totalInternationalApps,
        users: usersCount,
        services: servicesCount,
        exams: examsCount,
        faqs: faqsCount,
        scholarships: scholarshipsCount,
        testimonials: testimonialsCount,
        recentUniversities,
        recentBlogs,
      }),
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

