import { BaseRepository } from './base.repository';

export class ContentRepository extends BaseRepository<any> {
  constructor() {
    super('static_page_contents');
  }

