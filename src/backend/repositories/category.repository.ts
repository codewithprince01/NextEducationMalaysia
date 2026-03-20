import { BaseRepository } from './base.repository';
import { CourseCategory } from '@prisma/client';

export class CategoryRepository extends BaseRepository<CourseCategory> {
  constructor() {
    super('courseCategory');
  }

  async findByUniversity(universityId: bigint) {
    return this.model.findMany({
      where: {
        programs: {
          some: { university_id: universityId },
        },
      },
      select: { id: true, name: true, slug: true },
    });
  }
}
