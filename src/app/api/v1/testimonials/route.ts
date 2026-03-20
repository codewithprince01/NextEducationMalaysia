import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, feedbackService, serializeBigInt } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '36');

    const result = await feedbackService.getTestimonials(page, limit);

    return apiSuccess({
      testimonials: serializeBigInt(result.testimonials),
      seo: result.seo
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch testimonials', 500);
  }
});

export const POST = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.review || !body.user_type) {
      return apiError('Name, email, user_type and review are required', 400);
    }

    const testimonial = await feedbackService.storeTestimonial({
      name: body.name,
      email: body.email,
      user_type: body.user_type,
      country: body.country || 'N/A',
      review: body.review
    });

    return apiSuccess({ testimonial: serializeBigInt(testimonial) }, 'Review has been submitted successfully.', 201);
  } catch (error: any) {
    if (error.message === 'ALREADY_SUBMITTED') {
      return apiError('You have already submitted your review.', 409);
    }
    return apiError(error.message || 'Failed to submit review', 500);
  }
});
