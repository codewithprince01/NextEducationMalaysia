import { BaseRepository } from './base.repository';
import { UniversityProgram } from '@prisma/client';

export class ProgramRepository extends BaseRepository<UniversityProgram> {
  constructor() {
    super('universityProgram');
  }

  async findPaginated(where: any, page: number, perPage: number) {
    const skip = (page - 1) * perPage;
    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        include: {
          university: true,
          courseCategory: true,
          courseSpecialization: true,
        },
        skip,
        take: perPage,
        orderBy: { updated_at: 'desc' },
      }),
      this.model.count({ where }),
    ]);

    return { items, total };
  }
}
