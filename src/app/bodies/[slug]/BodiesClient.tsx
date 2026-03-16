'use client'

import React, { useState } from "react"
import {
  FaMapMarkerAlt,
  FaLocationArrow,
  FaStar,
  FaEye,
  FaDownload,
} from "react-icons/fa"
import Link from "next/link"

export default function BodiesClient() {
  const [activeTab, setActiveTab] = useState("overview")

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses" },
    { id: "gallery", label: "Gallery" },
    { id: "videos", label: "Videos" },
    { id: "reviews", label: "Reviews" },
    { id: "ranking", label: "Ranking" },
  ]

  const handleTabChange = (id: string) => {
    setActiveTab(id)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Logo + Title */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            {/* Left - Logo + Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full text-left">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-100 shrink-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/1/1b/RMIT_University_Logo.svg"
                  alt="University Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  University of Malaysia
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-blue-500" />
                    <span className="text-blue-600 font-medium">
                      Location: Kuala Lumpur
                    </span>
                  </div>
                  <button className="flex items-center gap-2 border border-blue-700 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50 transition whitespace-nowrap">
                    <FaLocationArrow className="text-sm" />
                    Get Direction
                  </button>
                </div>
              </div>
            </div>

            {/* Right Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm w-full lg:w-auto">
              <div className="flex flex-col gap-1 items-start text-left">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Type</span>
                  <span className="bg-blue-700 text-white px-2 py-1 rounded-full font-medium text-sm">
                    Public
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <span className="font-lg">SETARA Ranking:</span>
                  {[1, 2, 3].map((i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                  {[4, 5].map((i) => (
                    <FaStar key={i} className="text-black text-sm" />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 items-start text-left">
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-950 rounded-full " />
                  <div className="animate-pulse">Featured</div>
                </div>
                <div className="text-gray-600 text-sm">
                  Approved By : <span className="font-medium uppercase">MQA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">
            <div className="md:col-span-6 relative">
              <img
                src="https://www.educationmalaysia.in/uploads/university/photos/IMG_20221209_181808.png"
                alt="Main"
                className="w-full h-[220px] sm:h-[300px] md:h-[350px] object-cover rounded-lg"
              />
              <button className="absolute bottom-4 left-4 bg-blue-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-800 transition-colors">
                View All Photos
              </button>
            </div>

            <div className="md:col-span-6 grid grid-cols-2 gap-3">
              {[
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=300&h=200&fit=crop",
                "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=300&h=200&fit=crop",
              ].map((photo, index) => (
                <div
                  key={index}
                  className="relative h-[120px] sm:h-[140px] md:h-[168px]"
                >
                  <img
                    src={photo}
                    alt={`Campus ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* University Details Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:mt-2">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
            {/* Left Info */}
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm text-gray-700">
                  Established year: 1970
                </div>

                <div className="bg-gray-100 px-3 py-1.5 rounded-md text-sm text-gray-700 gap-2 flex items-center">
                  <FaEye className="text-sm" />
                  Views: 416
                </div>
              </div>

              {/* Ranking */}
              <div className="bg-gray-100 px-5 py-3 rounded-xl text-gray-700 w-full border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-gray-900">
                      #457
                    </span>
                    <span className="text-gray-600 text-sm sm:text-base">in World</span>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-gray-900">#4</span>
                    <span className="text-gray-600 text-sm sm:text-base">in Malaysia</span>
                  </div>
                  <button className="sm:ml-auto text-blue-600 font-bold hover:underline text-sm sm:text-base">
                    View ranking details →
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full lg:w-[350px] shrink-0">
              <button className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-bold flex items-center justify-center gap-2">
                Apply Now
              </button>
              <button className="w-full bg-white border border-blue-200 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium">
                <FaDownload className="text-sm" />
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 px-6 text-sm sm:text-base font-bold transition-all border-b-4 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area (Placeholder for static route) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100 text-center">
            <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase">Institution Overview</h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                This section contains detailed information about the institution, including its history, academic excellence, and campus facilities. This is a high-fidelity static template as seen in the original project.
            </p>
        </div>
      </div>
    </div>
  )
}
