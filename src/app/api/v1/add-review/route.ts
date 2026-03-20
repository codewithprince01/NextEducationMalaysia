import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, feedbackService, serializeBigInt } from '@/backend';

export const POST = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.university_id || !body.name || !body.email || !body.mobile || !body.rating) {
      return apiError('University ID, name, email, mobile and rating are required', 400);
    }

    const review = await feedbackService.addUniversityReview({
      university_id: body.university_id,
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      program: body.program || 'N/A',
      passing_year: body.passing_year || 'N/A',
      review_title: body.review_title || 'Review',
      description: body.review || body.description,
      rating: parseInt(body.rating),
      anonymous: body.anonymous === true || body.anonymous === 'true'
    });

    return apiSuccess({ review: serializeBigInt(review) }, 'Your review has been submitted for moderation.', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit review', 500);
  }
});
