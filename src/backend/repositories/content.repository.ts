import { BaseRepository } from './base.repository';
import { static_page_contents } from '@prisma/client';

export class ContentRepository extends BaseRepository<static_page_contents> {
  constructor() {
    super('static_page_contents');
  }

  async findByPage(page: string, position?: string) {
    return this.model.findMany({
      where: {
        page_name: page,
        ...(position && { position }),
      },
    });
  }
}
