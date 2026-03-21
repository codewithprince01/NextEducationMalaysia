'use client'

import React, { useState, useEffect } from 'react'
import { Star, CheckCircle } from 'lucide-react'

interface Review {
  id: number
  name: string
  created_at: string
  rating: number
  review_title: string
  description: string
  program: string | null
  passing_year: string | null
}

interface ReviewStats {
  total_reviews: number
  average_rating: string
}

const ReviewCard = ({ review }: { review: Review }) => {
  const reviewerName = review.name || 'Anonymous'
  const created = review.created_at ? new Date(review.created_at) : null
  const hasValidDate = Boolean(created && !isNaN(created.getTime()))

  return (
    <div className="bg-white rounded-md border border-gray-200 p-4 mb-4 relative shadow-sm font-sans">
      {/* Floating Score */}
      <div className="absolute top-4 right-4 bg-[#0a1d37] text-white font-bold text-lg px-3 py-1 rounded">
        {review.rating}
      </div>

      <div className="flex items-center gap-3 mb-2">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-[#0a1d37] flex items-center justify-center text-white text-xl font-bold shrink-0">
          {reviewerName.charAt(0).toUpperCase()}
        </div>

        {/* Name + Verified + Stars */}
        <div>
          <div className="flex items-center gap-1 text-lg font-semibold text-gray-800">
            {reviewerName}
            <CheckCircle className="text-green-600 fill-green-600/10" size={16} />
          </div>
          <div className="flex items-center text-green-600 text-sm mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < review.rating ? "text-green-600 fill-green-600" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600 text-xs whitespace-nowrap">✔ Verified Review</span>
          </div>
        </div>
      </div>

      {/* Date */}
      <p className="text-sm text-gray-500 mb-2">
        Post on - {hasValidDate ? created!.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A'} <span className="font-semibold text-gray-800">by {reviewerName}</span>
      </p>

      {/* Program & Year */}
      {review.program && (
        <p className="text-sm text-blue-600 font-medium mb-2">
          {review.program} {review.passing_year && `(${review.passing_year})`}
        </p>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {review.review_title}
      </h3>

      {/* Body */}
      <p className="text-gray-700 leading-relaxed text-sm">
        {review.description}
      </p>
    </div>
  )
}

export default function UniversityReviewsClient({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/university/${slug}/reviews`)
        const json = await response.json()
        const payload = json?.data?.reviews
        if (payload?.items) {
          setReviews(payload.items)
          setStats(payload.stats)
        } else if (Array.isArray(json?.data)) {
          const items = json.data as Review[]
          setReviews(items)
          if (items.length > 0) {
            const avg = (items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / items.length).toFixed(1)
            setStats({ total_reviews: items.length, average_rating: avg })
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-40 bg-gray-100 rounded-lg" />
        {[1, 2].map(i => <div key={i} className="h-48 bg-gray-50 rounded-lg" />)}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
          <p>No reviews available for this university.</p>
        </div>
      </div>
    )
  }

  const avgRating = parseFloat(stats?.average_rating || '5')
  const ratingPercentage = Math.round((avgRating / 5) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      {/* Top Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#0a1d37] mb-3">
          Rating and Reviews
        </h2>
        <div className="flex justify-center items-center gap-1.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={24}
              className={i < Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
            />
          ))}
          <span className="text-xl font-bold ml-2 text-gray-800">
            {stats?.average_rating || "5.0"} out of 5
          </span>
        </div>
        <p className="text-gray-600 font-medium">
          Based on {stats?.total_reviews || reviews.length} Review
          {(stats?.total_reviews || reviews.length) > 1 ? "s" : ""}
        </p>
        <div className="mt-3">
          <p className="font-bold text-gray-800 text-lg">
            {ratingPercentage}% Reviewer
          </p>
          <p className="text-gray-500">Recommends this college</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Showing {reviews.length} Review{reviews.length > 1 ? "s" : ""}
        </h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
