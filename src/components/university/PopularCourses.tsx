"use client"

import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';

interface PopularCoursesProps {
  slug: string;
}

const PopularCourses: React.FC<PopularCoursesProps> = ({ slug }) => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        const res: any = await axios.get(`${API_BASE}/university-overview/${slug}`);
        setData(res.data?.data || res.data || {});
      } catch (err) {
        console.error("Failed to fetch popular courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularCourses();
  }, [slug]);

  const universityCourses = data.university_specializations_for_courses || [];
  const malaysiaCourses = data.all_specializations_for_courses || [];
  const topCourses = data.specializations_with_contents || [];

  const sections = [
    {
      title: "University Popular Courses",
      courses: universityCourses.slice(0, 15),
    },
    {
      title: "Malaysia Popular Courses",
      courses: malaysiaCourses.slice(0, 15),
    },
    {
      title: "Top Courses to Study in Malaysia",
      courses: topCourses.slice(0, 15),
    },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="grid grid-cols-1 gap-4 sm:gap-8">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-[#f6f9fb] rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition group"
          >
            <h2 className="text-base sm:text-lg font-bold text-[#003366] mb-3 sm:mb-4">
              {section.title}
            </h2>

            <h3 className="text-sm sm:text-base font-semibold text-black mb-3 sm:mb-4">
              Top Streams:
            </h3>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
              {section.courses.length > 0 ? (
                section.courses.map((course: any, idx: number) => {
                  let targetUrl = "#";

                  if (section.title === "University Popular Courses") {
                    const params = new URLSearchParams();
                    const specId = course.specialization_id || course.id;
                    const catId = course.course_category_id || course.category?.id || course.category_id;

                    if (specId) params.set("specialization_id", specId);
                    if (catId) params.set("course_category_id", catId);

                    targetUrl = `/university/${slug}/courses?${params.toString()}`;
                  } else if (section.title === "Top Courses to Study in Malaysia") {
                    const specSlug = course.name
                      ? course.name.toLowerCase().trim().replace(/\s+/g, "-")
                      : "";
                    targetUrl = `/specialization/${specSlug}`;
                  } else {
                    const specSlug = course.name
                      ? course.name.toLowerCase().trim().replace(/\s+/g, "-")
                      : "";
                    const params = new URLSearchParams();
                    if (specSlug) params.set("specialization", specSlug);

                    const catSlug = course.category_slug || (course.category ? course.category.toLowerCase().trim().replace(/\s+/g, "-") : "");
                    if (catSlug) params.set("category", catSlug);

                    targetUrl = `/courses-in-malaysia?${params.toString()}`;
                  }

                  return (
                    <Link
                      key={idx}
                      href={targetUrl}
                      className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 border border-gray-300 rounded-full text-xs sm:text-sm text-gray-800 hover:bg-blue-50 transition cursor-pointer active:scale-95"
                    >
                      <FaArrowRight className="text-blue-600 text-[10px] sm:text-xs shrink-0" />
                      <span className="text-xs sm:text-sm">{course.name}</span>
                    </Link>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">
                  No courses available for this section.
                </p>
              )}
            </div>

            <div className="text-right">
              <button
                onClick={() => router.push("/courses")}
                className="bg-[#003366] text-white px-4 sm:px-5 py-2 text-xs sm:text-sm rounded-full hover:bg-[#002244] transition font-medium cursor-pointer"
              >
                View All
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCourses;
