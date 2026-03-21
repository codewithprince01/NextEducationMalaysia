'use client'

import React, { useState, useEffect } from 'react'

interface VideoItem {
  video_url?: string
  video_link?: string
}

const toEmbeddableUrl = (url: string) => {
  if (!url) return ''
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0]
    return id ? `https://www.youtube.com/embed/${id}` : url
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0]
    return id ? `https://www.youtube.com/embed/${id}` : url
  }
  return url
}

export default function UniversityVideosClient({ slug }: { slug: string }) {
  const [videos, setVideos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/university/${slug}/videos`)
      .then(r => r.json())
      .then(json => {
        const rawVideos: VideoItem[] =
          json?.data?.universityVideos ||
          json?.data?.videos ||
          json?.data ||
          []
        const mapped = rawVideos
          .map(v => toEmbeddableUrl(v.video_url || v.video_link || ''))
          .filter(Boolean)
        setVideos(mapped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mt-6 animate-pulse">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Videos</h2>
        <div className="w-full h-64 bg-gray-100 rounded-lg shadow-sm" />
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Videos</h2>
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
          <p>No videos available for this university.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((url, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden shadow-md bg-black">
            <iframe
              src={url}
              title={`Campus Video ${i + 1}`}
              className="w-full h-64 border-0"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </div>
  )
}
