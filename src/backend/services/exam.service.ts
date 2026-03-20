import { prisma } from '@/lib/db-fresh';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Exam Service (Singleton)
 */
export class ExamService {
  private static instance: ExamService;

  private constructor() {}

  static getInstance(): ExamService {
    if (!ExamService.instance) {
      ExamService.instance = new ExamService();
    }
    return ExamService.instance;
  }

  /**
   * Get all active exams.
   */
  async getExams() {
    try {
      const exams = await prisma.$queryRawUnsafe('SELECT * FROM exams WHERE status = 1 ORDER BY position ASC');
      return serializeBigInt(exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
  }

  /**
   * Get exam by slug.
   */
  async getExamBySlug(slug: string) {
    try {
      const examResult = await prisma.$queryRawUnsafe('SELECT * FROM exams WHERE slug = ? AND status = 1 LIMIT 1', slug) as any[];
      const exam = examResult[0];

      if (!exam) return null;

      const faqs = await prisma.$queryRawUnsafe('SELECT * FROM exam_faqs WHERE exam_id = ? AND status = 1 ORDER BY position ASC', exam.id);

      return serializeBigInt({
        ...exam,
        faqs
      });
    } catch (error) {
      console.error('Error fetching exam by slug:', error);
      return null;
    }
  }

  /**
   * Get SEO for exam page.
   */
  async getExamSeo(slug: string) {
    try {
      const examResult = await prisma.$queryRawUnsafe('SELECT meta_title, meta_description, meta_keyword, og_image_path FROM exams WHERE slug = ? AND status = 1 LIMIT 1', slug) as any[];
      const exam = examResult[0];

      if (!exam) return null;

      return {
        title: exam.meta_title,
        description: exam.meta_description,
        keywords: exam.meta_keyword,
        image: exam.og_image_path,
      };
    } catch (error) {
      console.error('Error fetching exam SEO:', error);
      return null;
    }
  }
}

export const examService = ExamService.getInstance();
