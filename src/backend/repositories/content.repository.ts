import { BaseRepository } from './base.repository';

export class ContentRepository extends BaseRepository<any> {
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
