'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import {
  FaUserGraduate,
  FaUniversity,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaAward,
} from "react-icons/fa"

const qualificationLevels = [
  {
    title: "PRE UNIVERSITY",
    slug: "pre-university",
    icon: <FaUserGraduate size={40} />,
    description:
      "A candidate who has passed SPM or O-Level exams and is looking for further studies can enroll into a Pre-University preparatory course programme.",
  },
  {
    title: "DIPLOMA",
    slug: "diploma",
    icon: <FaGraduationCap size={40} />,
    description:
      "It can be considered the equivalent of a first year degree & qualification is considered to be higher than Pre-University. It is offered in specific function areas.",
  },
  {
    title: "UNDER GRADUATE",
    slug: "under-graduate",
    icon: <FaUniversity size={40} />,
    description:
      "A degree which is the first level of post secondary education a student wishes to pursue.",
  },
  {
    title: "POST GRADUATE",
    slug: "post-graduate",
    icon: <FaChalkboardTeacher size={40} />,
    description:
      "Post Graduate Diploma is a version of shorter qualification than a masters degree although at the same scholastic level.",
  },
  {
    title: "PhD DOCTORATE",
    slug: "phd",
    icon: <FaAward size={40} />,
    description:
      "Doctor of Philosophy is also called a PhD in short. Once a candidate completes this degree, they are qualified to teach at the university level.",
  },
]

export default function QualificationsHubClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('from') === 'popular-courses') {
      router.replace('/courses', { scroll: false })
    }
  }, [router, searchParams])

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="py-10 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Select Your <span className="text-blue-600">Qualified Level</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {qualificationLevels.map((item, index) => (
            <Link
              key={index}
              href={`/courses/${item.slug}`}
              className="bg-blue-50 rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition duration-300 group"
            >
              <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm mb-5">{item.description}</p>
              <div className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                SELECT
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

