'use client'

import React, { useState, useEffect } from 'react'
import { Play, Film, AlertCircle } from 'lucide-react'

interface Video {
  id: number
  video_url: string
}

export default function UniversityVideosClient({ uname }: { uname: string }) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/university/${uname}/videos`)
        const json = await response.json()
        if (json.data?.universityVideos) {
          setVideos(json.data.universityVideos)
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [uname])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="aspect-video bg-gray-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Campus Videos</h3>
        <p className="text-gray-500">There are no videos available for this institution at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Play className="w-6 h-6 text-white fill-current" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Virtual Campus Tour</h2>
          <p className="text-gray-500">Explore campus life and facilities through these videos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {videos.map((video) => {
          // Normalize URL for embed if it's a standard youtube link
          let embedUrl = video.video_url
          if (embedUrl?.includes('youtube.com/watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/')
          } else if (embedUrl?.includes('youtu.be/')) {
            embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/')
          }

          return (
            <div key={video.id} className="group relative">
              <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                 <Film className="w-5 h-5" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
