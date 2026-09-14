import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [
      universitiesCount,
      programsCount,
      blogsCount,
      categoriesCount,
      specializationsCount,
      malaysiaApps,
      internationalApps,
      usersCount,
    ] = await Promise.all([
      prisma.university.count(),
      prisma.universityProgram.count(),
      prisma.blog.count(),
      prisma.courseCategory.count(),
      prisma.courseSpecialization.count(),
      prisma.malaysiaApplication.aggregate({ _sum: { count: true } }),
      prisma.internationalStudentData.aggregate({ _sum: { count: true } }),
      prisma.user.count(),
    ]);

    const totalApplications =
      (malaysiaApps._sum.count || 0) + (internationalApps._sum.count || 0);

    return NextResponse.json({
      success: true,
      data: {
        universities: universitiesCount,
        programs: programsCount,
        blogs: blogsCount,
        categories: categoriesCount,
        specializations: specializationsCount,
        applications: totalApplications,
        users: usersCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

