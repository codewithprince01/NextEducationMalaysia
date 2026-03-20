'use client'

import React, { useState, useEffect } from 'react'

interface Video {
  video_url: string
}

export default function UniversityVideosClient({ slug }: { slug: string }) {
  const [videos, setVideos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/university/${slug}/videos`)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setVideos(json.data)
        }
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
