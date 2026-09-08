"use client"

import React, { useState, useEffect } from "react";
import { GraduationCap, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '');

const popularCoursesCache: Record<string, any> = {};

interface PopularCoursesProps {
  slug: string;
}

const PopularCourses: React.FC<PopularCoursesProps> = ({ slug }) => {
  const [data, setData] = useState<any>(() => popularCoursesCache[slug] || {});
  const [loading, setLoading] = useState<boolean>(() => !popularCoursesCache[slug]);

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
        // If already in memory cache, load instantly
        if (popularCoursesCache[slug] && hasCourseLists(popularCoursesCache[slug])) {
          setData(popularCoursesCache[slug]);
          setLoading(false);
          return;
        }

        // Fast local Next.js API call (~50ms)
        try {
          const localRes = await fetch(`/api/university/${slug}/popular-courses`, { next: { revalidate: 1800 } });
          if (localRes.ok) {
            const localJson = await localRes.json();
            const localPayload = extractData(localJson);
            if (localPayload && hasCourseLists(localPayload)) {
              popularCoursesCache[slug] = localPayload;
              setData(localPayload);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Fallback below
        }

        const res: any = await axios.get(`${API_BASE}/university-overview/${slug}`);
        const payload = extractData(res);
        if (hasCourseLists(payload)) {
          popularCoursesCache[slug] = payload;
          setData(payload);
          return;
        }

        const coursesRes: any = await axios.get(`/api/university/${slug}/courses`, {
          params: { page: 1, limit: 50 },
        });
        const coursesPayload = coursesRes?.data?.data || [];
        const fallback = buildFallbackFromUniversityCourses(coursesPayload);
        const combined = { ...payload, ...fallback };
        popularCoursesCache[slug] = combined;
        setData(combined);
      } catch (err) {
        console.error("Failed to fetch popular courses:", err);
        try {
          const coursesRes: any = await axios.get(`/api/university/${slug}/courses`, {
            params: { page: 1, limit: 50 },
          });
          const coursesPayload = coursesRes?.data?.data || [];
          const fallback = buildFallbackFromUniversityCourses(coursesPayload);
          popularCoursesCache[slug] = fallback;
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
      subtitle: "Popular programmes at this university",
      icon: GraduationCap,
      badge: "Campus Specialisations",
      courses: universityCourses.slice(0, 15),
    },
    {
      title: "Malaysia Popular Courses",
      subtitle: "Trending specialisations across Malaysia",
      icon: TrendingUp,
      badge: "Popular in Malaysia",
      courses: malaysiaCourses.slice(0, 15),
    },
    {
      title: "Top Courses to Study in Malaysia",
      subtitle: "In-demand fields with high career outcomes",
      icon: Sparkles,
      badge: "High Demand",
      courses: topCourses.slice(0, 15),
    },
  ];

  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 animate-pulse space-y-3">
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
            <div className="flex flex-wrap gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-8 bg-slate-100 rounded-xl w-28"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {sections.map((section, index) => {
        const SectionIcon = section.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <SectionIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {section.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => window.location.assign('/courses?from=popular-courses')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Tags Grid */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                      className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200/80 hover:border-blue-200 transition-colors"
                    >
                      <span>{course.name}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-600 shrink-0" />
                    </Link>
                  );
                })
              ) : (
                <p className="text-gray-400 text-xs py-1">
                  No courses listed for this stream yet.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PopularCourses;
