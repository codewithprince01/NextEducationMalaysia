import React from 'react'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-400 leading-none">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Don't worry, it happens to the best of us!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>

          <Link
            href="/courses-in-malaysia"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
          >
            <Search className="w-5 h-5" />
            Browse Courses
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/universities"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Universities
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/scholarships"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Scholarships
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact-us"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Contact Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/faqs"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
