'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MdDelete } from "react-icons/md";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default function AppliedCollegesClient() {
  const [appliedCourses, setAppliedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplied = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/student/applied-college`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (Array.isArray(data?.applied_programs)) {
          setAppliedCourses(data.applied_programs);
        } else if (Array.isArray(data)) {
          setAppliedCourses(data);
        } else {
          setAppliedCourses([]);
        }
      } catch (err) {
        console.error("Error fetching applied courses:", err);
        setAppliedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplied();
  }, []);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      // Note: The old project used a GET request for deletion
      await fetch(`${API_BASE}/student/delete-program/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppliedCourses((prev) => prev.filter((course) => course.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Applied Colleges
      </h2>

      {appliedCourses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-sm">
          <p className="text-gray-700 mb-6 font-medium">
            Nothing to show yet. You haven't applied to any colleges.
          </p>
          <Link
            href="/courses-in-malaysia"
            className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold shadow-lg shadow-blue-800/20 transition-all active:scale-95"
          >
            Browse Colleges
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {appliedCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-800 transition-colors">
                {course.university_program?.course_name || "N/A"}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider">
                    Study Mode
                  </span>
                  <span className="font-medium">{course.university_program?.study_mode || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider">
                    Duration
                  </span>
                  <span className="font-medium">{course.university_program?.duration || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider">
                    Deadline
                  </span>
                  <span className="font-medium">{course.university_program?.application_deadline || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider">
                    Intake
                  </span>
                  <span className="font-medium">{course.university_program?.intake || "N/A"}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-800 text-xs">University:</span>
                    <span className="text-gray-900 font-semibold">{course.university_program?.university?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-800 text-xs">Application Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      course.app_status?.toLowerCase() === 'accepted' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {course.app_status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(course.id)}
                  className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-red-100"
                >
                  <MdDelete className="text-lg" /> Delete
                </button>
              </div>
            </div>
          ))}

          <div className="text-center mt-8">
            <Link
              href="/courses-in-malaysia"
              className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold transition shadow-lg shadow-blue-800/20"
            >
              Browse More Colleges
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
