import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, serializeBigInt } from '@/backend';
import { prisma } from '@/lib/db-fresh';

export const POST = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({} as any));

    const universityId = Number(body.university_id || body.university);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const mobile = String(body.mobile || '').trim();
    const program = String(body.program || '').trim();
    const passingYear = String(body.passing_year || '').trim();
    const reviewTitle = String(body.review_title || '').trim();
    const description = String(body.review || body.description || '').trim();
    const rating = Number(body.rating);

    if (!name || !/^[a-zA-Z ]+$/i.test(name)) {
      return apiError('Name must contain only letters and spaces', 422);
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return apiError('Valid email is required', 422);
    }
    if (!mobile || !/^\d+$/.test(mobile)) {
      return apiError('Mobile must be numeric', 422);
    }
    if (!Number.isFinite(universityId) || universityId <= 0) {
      return apiError('University is required', 422);
    }
    if (!program) {
      return apiError('Program is required', 422);
    }
    if (!passingYear || !/^\d+$/.test(passingYear)) {
      return apiError('Passing year is required', 422);
    }
    if (!reviewTitle || reviewTitle.length < 20 || reviewTitle.length > 100) {
      return apiError('Review title must be between 20 and 100 characters', 422);
    }
    if (!description || description.length < 150) {
      return apiError('Review description must be at least 150 characters', 422);
    }
    if (!Number.isFinite(rating) || rating <= 0) {
      return apiError('Rating is required', 422);
    }

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total FROM reviews WHERE email = ? AND university_id = ? AND program = ?`,
      email,
      universityId,
      program
    );
    const existing = Number(existingRows?.[0]?.total || 0);
    if (existing > 0) {
      return apiError('You have already submitted your review.', 409);
    }

    const website = process.env.SITE_VAR || 'MYS';

    // Old-project style insert. Keep fallback for DB variants where `website` may not exist.
    try {
      await prisma.$queryRawUnsafe(
        `
        INSERT INTO reviews
        (website, name, email, mobile, university_id, program, passing_year, review_title, description, rating, status, created_at, updated_at)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
        `,
        website,
        name,
        email,
        mobile,
        universityId,
        program,
        passingYear,
        reviewTitle,
        description,
        Math.round(rating)
      );
    } catch {
      await prisma.$queryRawUnsafe(
        `
        INSERT INTO reviews
        (name, email, mobile, university_id, program, passing_year, review_title, description, rating, status, created_at, updated_at)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
        `,
        name,
        email,
        mobile,
        universityId,
        program,
        passingYear,
        reviewTitle,
        description,
        Math.round(rating)
      );
    }

    const insertedRows: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT id
      FROM reviews
      WHERE email = ? AND university_id = ? AND program = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      email,
      universityId,
      program
    );
    const insertedId = Number(insertedRows?.[0]?.id || 0);
    if (!insertedId) {
      return apiError('Review saved but unable to resolve review id.', 500);
    }

    return apiSuccess(
      { review: serializeBigInt({ id: insertedId }) },
      'Review has been submitted successfully.',
      201
    );
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit review', 500);
  }
});
