import { prisma } from '@/lib/db-fresh';
import { SITE_VAR } from '../utils/constants';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Feedback Service (Singleton)
 */
export class FeedbackService {
  private static instance: FeedbackService;

  private constructor() {}

  static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Get paginated testimonials with SEO metadata.
   */
  async getTestimonials(page: number = 1, limit: number = 36) {
    const skip = (page - 1) * limit;

    const [testimonials, totalRaw, seo] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT id, user_type, name, country, review, dpname, dppath, website, status, created_at
        FROM testimonials 
        WHERE status = 1 AND website = ? 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
      `, SITE_VAR, limit, skip),
      prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM testimonials WHERE status = 1 AND website = ?', SITE_VAR).then(res => (res as any)[0].count),
      prisma.staticPageSeo.findFirst({
        where: { page: 'what-people-say' }
      })
    ]);
    const total = Number(totalRaw || 0);

    return {
      testimonials: {
        data: serializeBigInt(testimonials),
        current_page: page,
        total: total,
        last_page: Math.ceil(total / limit)
      },
      seo: {
        meta_title: seo?.meta_title || '',
        meta_keyword: seo?.meta_keyword || '',
        meta_description: seo?.meta_description || '',
        seo_rating: (seo as any)?.seo_rating || '',
        og_image_path: seo?.og_image_path || null
      }
    };
  }

  /**
   * Submit a new student/user testimonial.
   */
  async storeTestimonial(data: {
    name: string;
    email: string;
    user_type: string;
    country: string;
    review: string;
  }) {
    // Check if already submitted
    const existingRows = (await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total FROM testimonials WHERE email = ? AND website = ?`,
      data.email,
      SITE_VAR
    )) as any[];
    const existing = Number(existingRows?.[0]?.total || 0);

    if (existing > 0) {
      throw new Error('ALREADY_SUBMITTED');
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO testimonials
      (website, user_type, name, email, country, review, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      SITE_VAR,
      data.user_type,
      data.name,
      data.email,
      data.country,
      data.review,
      1
    );

    const inserted = (await prisma.$queryRawUnsafe(
      `
      SELECT id, user_type, name, country, review, dpname, dppath, website, status, created_at
      FROM testimonials
      WHERE email = ? AND website = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      data.email,
      SITE_VAR
    )) as any[];

    return inserted?.[0] || null;
  }

  /**
   * Add a university review from the university detail page.
   */
  async addUniversityReview(data: {
    university_id: string;
    name: string;
    email: string;
    mobile: string;
    program: string;
    passing_year: string;
    review_title: string;
    description: string;
    rating: number;
    anonymous?: boolean;
  }) {
    return await prisma.review.create({
      data: {
        university_id: Number(data.university_id),
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        program: data.program,
        passing_year: data.passing_year,
        review_title: data.review_title,
        description: data.description,
        rating: data.rating,
        status: 0 // Pending approval
      }
    });
  }
}

export const feedbackService = FeedbackService.getInstance();
