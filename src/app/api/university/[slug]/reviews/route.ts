import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db-fresh'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const uniRows = await prisma.$queryRawUnsafe(
      `SELECT id FROM universities WHERE uname = ? AND status = 1 LIMIT 1`,
      slug
    ) as any[]

    if (!uniRows.length) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const universityId = Number(uniRows[0].id)
    const rawReviews = await prisma.$queryRawUnsafe(
      `SELECT id, name, created_at, rating, review_title, description, program, passing_year
       FROM reviews
       WHERE university_id = ? AND (status = 1 OR status = true)
       ORDER BY id DESC`,
      universityId
    ) as any[]

    const reviews = rawReviews.map((r: any) => {
      const createdAt = r?.created_at ? String(r.created_at) : null
      const safeCreatedAt =
        createdAt && !createdAt.startsWith('0000-00-00') ? createdAt : null
      return {
        ...r,
        name: r?.name || 'Anonymous',
        created_at: safeCreatedAt,
        rating: Number(r?.rating || 0),
        review_title: r?.review_title || 'Review',
        description: r?.description || '',
      }
    })

    const totalReviews = reviews.length
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((acc, r: any) => acc + Number(r?.rating || 0), 0) / totalReviews).toFixed(1)
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
