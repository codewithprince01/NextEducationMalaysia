import { prisma } from '@/lib/db';
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

    const [testimonials, total, seo] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT id, user_type, user_name, user_designation, content, img_path, website, status 
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
        seo_rating: seo?.seo_rating || '',
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
    const existing = await prisma.testimonials.findFirst({
      where: { email: data.email }
    });

    if (existing) {
      throw new Error('ALREADY_SUBMITTED');
    }

    return await prisma.testimonials.create({
      data: {
        website: SITE_VAR,
        name: data.name,
        email: data.email,
        user_type: data.user_type,
        country: data.country,
        review: data.review,
        status: false // Pending approval
      }
    });
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
        website: SITE_VAR,
        university_id: BigInt(data.university_id),
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        program: data.program,
        passing_year: data.passing_year,
        review_title: data.review_title,
        description: data.description,
        rating: data.rating,
        anonymous: data.anonymous ?? false,
        status: false // Pending approval
      }
    });
  }
}

export const feedbackService = FeedbackService.getInstance();
