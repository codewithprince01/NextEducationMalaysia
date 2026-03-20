import { UniversityRepository } from './university.repository';
import { ProgramRepository } from './program.repository';
import { ContentRepository } from './content.repository';
import { CategoryRepository } from './category.repository';

export const universityRepo = new UniversityRepository();
export const programRepo = new ProgramRepository();
export const contentRepo = new ContentRepository();
export const categoryRepo = new CategoryRepository();
