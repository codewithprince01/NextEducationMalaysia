"use client"

import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api';

interface PopularCoursesProps {
  slug: string;
}

const PopularCourses: React.FC<PopularCoursesProps> = ({ slug }) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasCourseLists = (payload: any) => {
      const university = payload?.university_specializations_for_courses;
      const malaysia = payload?.all_specializations_for_courses;
      const top = payload?.specializations_with_contents;
      return (
        (Array.isArray(university) && university.length > 0) ||
        (Array.isArray(malaysia) && malaysia.length > 0) ||
        (Array.isArray(top) && top.length > 0)
      );
    };

    const buildFallbackFromUniversityCourses = (courses: any[]) => {
      const items = Array.isArray(courses) ? courses : [];
      const seen = new Set<string>();
      const mapped = items
        .map((course: any) => {
          const name =
            course?.course_name ||
            course?.name ||
            course?.courseSpecialization?.name ||
            course?.spec_name ||
            "";
          const cleanedName = typeof name === "string" ? name.trim() : "";
          if (!cleanedName) return null;
          const key = cleanedName.toLowerCase();
          if (seen.has(key)) return null;
          seen.add(key);
          return {
            id: course?.specialization_id || course?.id || null,
            name: cleanedName,
            slug:
              course?.courseSpecialization?.slug ||
              course?.spec_slug ||
              cleanedName.toLowerCase().replace(/\s+/g, "-"),
            specialization_id: course?.specialization_id || course?.id || null,
            course_category_id: course?.course_category_id || course?.courseCategory?.id || null,
            category_slug: course?.courseCategory?.slug || course?.category_slug || null,
            category: course?.courseCategory?.name || course?.category_name || null,
          };
        })
        .filter(Boolean)
        .slice(0, 15);

      return {
        university_specializations_for_courses: mapped,
        all_specializations_for_courses: mapped,
        specializations_with_contents: mapped,
      };
    };

    const extractData = (payload: any) => {
      if (!payload) return {};
      if (payload?.data?.data && typeof payload.data.data === "object") return payload.data.data;
      if (payload?.data && typeof payload.data === "object") return payload.data;
      if (typeof payload === "object") return payload;
      return {};
    };

    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        // Prefer local API to avoid remote schema mismatch and keep behavior consistent.
        try {
          const localRes: any = await axios.get(`/api/university/${slug}/popular-courses`, {
            params: { _ts: Date.now() },
          });
          const localPayload = extractData(localRes);
          if (localPayload && Object.keys(localPayload).length > 0 && hasCourseLists(localPayload)) {
            setData(localPayload);
            return;
          }
        } catch {
          // Fallback to external API below
        }

        const res: any = await axios.get(`${API_BASE}/university-overview/${slug}`);
        const payload = extractData(res);
        if (hasCourseLists(payload)) {
          setData(payload);
          return;
        }

        const coursesRes: any = await axios.get(`/api/university/${slug}/courses`, {
          params: { page: 1, limit: 50, _ts: Date.now() },
        });
        const coursesPayload = coursesRes?.data?.data || [];
        const fallback = buildFallbackFromUniversityCourses(coursesPayload);
        setData({ ...payload, ...fallback });
      } catch (err) {
        console.error("Failed to fetch popular courses:", err);
        try {
          const coursesRes: any = await axios.get(`/api/university/${slug}/courses`, {
            params: { page: 1, limit: 50, _ts: Date.now() },
          });
          const coursesPayload = coursesRes?.data?.data || [];
          const fallback = buildFallbackFromUniversityCourses(coursesPayload);
          setData(fallback);
        } catch {
          setData({});
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPopularCourses();
  }, [slug]);

  const universityCourses = data?.university_specializations_for_courses || [];
  const malaysiaCourses = data?.all_specializations_for_courses || [];
  const topCourses = data?.specializations_with_contents || [];

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
                type="button"
                onClick={() => window.location.assign('/courses?from=popular-courses')}
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
