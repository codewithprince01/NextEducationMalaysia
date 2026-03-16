'use client'

import React, { useState, useEffect } from 'react'
import { Star, CheckCircle, MessageSquare, Quote, Users } from 'lucide-react'

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

export default function UniversityReviewsClient({ uname }: { uname: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/university/${uname}/reviews`)
        const json = await response.json()
        if (json.data?.reviews) {
          setReviews(json.data.reviews.items)
          setStats(json.data.reviews.stats)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [uname])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-100 rounded-[2.5rem]" />
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-[2rem]" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-gray-300">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-500">Be the first to share your experience at this institution.</p>
      </div>
    )
  }

  const avgRating = parseFloat(stats?.average_rating || '5')
  const ratingPercentage = Math.round((avgRating / 5) * 100)

  return (
    <div className="space-y-12">
      {/* Overview Stats Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400">
              <Users className="w-4 h-4" />
              Student Voice
            </div>
            <h2 className="text-3xl font-black">Student Ratings <br />& Experiences</h2>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-black text-blue-500">{avgRating}</div>
              <div className="space-y-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-current' : 'text-gray-600'}`} />
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Based on {stats?.total_reviews} Verified Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
             <div className="text-4xl font-black text-blue-500 mb-2">{ratingPercentage}%</div>
             <p className="text-lg font-bold">Recommended Institution</p>
             <p className="text-slate-400 text-sm mt-2">Percentage of students who would recommend this college to others based on their academic journey.</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black text-gray-900">Recent Testimonials</h3>
           <div className="text-xs font-bold text-blue-600 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-full">Showing {reviews.length} results</div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="group bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-blue-900/5 hover:border-blue-200 transition-all relative">
              <div className="absolute top-8 right-8 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-700">
                {review.rating}
              </div>
              
              <div className="flex gap-4 mb-6">
                 <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                    {review.name.charAt(0)}
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h4 className="font-black text-gray-900">{review.name}</h4>
                       <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">
                       {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                 </div>
              </div>

              {review.program && (
                <p className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-xs font-bold mb-6">
                   {review.program} {review.passing_year && `• Class of ${review.passing_year}`}
                </p>
              )}

              <div className="space-y-4">
                 <h5 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{review.review_title}</h5>
                 <div className="relative">
                    <Quote className="w-8 h-8 text-blue-50/50 absolute -top-4 -left-4" />
                    <p className="text-gray-600 leading-relaxed relative z-10">{review.description}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
