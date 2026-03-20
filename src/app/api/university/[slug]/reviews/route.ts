import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const university = await prisma.university.findFirst({
      where: { uname: slug, status: true as any },
      select: { id: true },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const reviews = await prisma.review.findMany({
      where: { university_id: university.id, status: true as any },
      orderBy: { created_at: 'desc' },
    })

    const totalReviews = reviews.length
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "0"

    return NextResponse.json({
      data: {
        reviews: {
          items: serializeBigInt(reviews),
          stats: {
            total_reviews: totalReviews,
            average_rating: avgRating
          }
        }
      }
    })
  } catch (err) {
    console.error('[University reviews API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
