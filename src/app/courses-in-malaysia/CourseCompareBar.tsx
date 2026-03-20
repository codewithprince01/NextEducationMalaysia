"use client"

import React from "react";
import { X, LayoutGrid, Building, ArrowRight } from "lucide-react";

interface CourseCompareBarProps {
  comparisonCourses: any[];
  onRemoveFromCompare: (id: number) => void;
  onCompare: () => void;
  onClearAll: () => void;
}

const CourseCompareBar: React.FC<CourseCompareBarProps> = ({
  comparisonCourses,
  onRemoveFromCompare,
  onCompare,
  onClearAll,
}) => {
  if (comparisonCourses.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.1)] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-2 lg:py-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Mobile Header */}
          <div className="flex justify-between items-center w-full lg:w-auto lg:hidden">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-gray-900 text-sm">Compare</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      num <= comparisonCourses.length
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClearAll}
              className="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Desktop Slots */}
          <div className="hidden lg:grid grid-cols-3 gap-3 w-full lg:flex-1">
            {[0, 1, 2].map((i) => {
              const course = comparisonCourses[i];
              return (
                <div
                  key={i}
                  className={`relative rounded-xl border p-3 flex items-center min-h-[96px] lg:min-h-[88px] overflow-hidden transition-all duration-300 group ${
                    course
                      ? "bg-linear-to-br from-blue-50/50 to-white border-blue-200 shadow-sm"
                      : "bg-gray-50/50 border-dashed border-gray-300 justify-center hover:bg-gray-100/50"
                  }`}
                >
                  {course ? (
                    <div className="min-w-0 pr-6 w-full">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider truncate max-w-[80px]">
                          {course.university?.inst_type || "Course"}
                        </span>
                      </div>
                      <h4
                        className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-tight mb-0.5"
                        title={course.course_name}
                      >
                        {course.course_name}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate flex items-center gap-1">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {course.university?.name}
                        </span>
                      </p>
                      <button
                        onClick={() => onRemoveFromCompare(course.id)}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-full transition-all shadow-sm opacity-100 lg:opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Remove Course"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center py-2">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center mb-1 text-gray-400 font-bold shadow-sm">
                        {i + 1}
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                        Add Course
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex flex-col gap-2 w-48 shrink-0">
            <button
              onClick={onCompare}
              disabled={comparisonCourses.length < 2}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all text-white flex items-center justify-center gap-2 cursor-pointer ${
                comparisonCourses.length >= 2
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Compare Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-red-600 font-semibold flex items-center justify-center gap-1 transition-colors hover:bg-gray-50 py-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-3 h-3" /> Clear All & Close
            </button>
          </div>

          {/* Mobile Compare Button */}
          <button
            onClick={onCompare}
            disabled={comparisonCourses.length < 2}
            className={`lg:hidden w-full py-2.5 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              comparisonCourses.length >= 2
                ? "bg-linear-to-r from-blue-600 to-indigo-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Compare Selected <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCompareBar;
