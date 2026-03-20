import { BaseRepository } from './base.repository';
import { University } from '@prisma/client';
import { prisma } from '@/lib/db-fresh';

export class UniversityRepository extends BaseRepository<University> {
  constructor() {
    super('university');
  }

  async findWithDetails(uname: string) {
    return this.model.findUnique({
      where: { uname },
      include: {
        instituteType: true,
        country: true,
        universityPhotos: true,
        universityVideos: true,
        universityReviews: {
          take: 5,
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: { programs: { where: { status: 1 } } },
        },
      },
    });
  }

  async findFeatured(limit = 10) {
    return this.model.findMany({
      where: { featured: 1, status: 1 },
      include: { instituteType: true, country: true },
      take: limit,
    });
  }
}
