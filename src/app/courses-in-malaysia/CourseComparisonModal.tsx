"use client"

import React from "react";
import {
  X,
  LayoutGrid,
  Building,
  BookOpen,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Star,
} from "lucide-react";

interface CourseComparisonModalProps {
  comparisonCourses: any[];
  appliedCourses: Set<number>;
  onApplyNow: (course: any) => void;
  onClose: () => void;
}

const CourseComparisonModal: React.FC<CourseComparisonModalProps> = ({
  comparisonCourses,
  appliedCourses,
  onApplyNow,
  onClose,
}) => (
  <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] animate-fadeInScale">
      {/* Modal Title Bar */}
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-blue-600" />
          Comparison Result
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-auto flex-1">
        {/* Mobile View */}
        <div className="sm:hidden p-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white text-center py-1.5 text-[10px] font-medium">
              ← Swipe left/right to compare courses →
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="p-3 font-bold text-[10px] uppercase sticky left-0 bg-blue-600 z-10 min-w-[90px] border-r border-blue-500 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                      CRITERIA
                    </th>
                    {comparisonCourses.map((course) => (
                      <th
                        key={course.id}
                        className="p-2.5 min-w-[180px] align-top border-r border-blue-500 last:border-0"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-bold text-blue-100 bg-white/20 rounded px-1.5 py-0.5 w-fit">
                            UNIVERSITY
                          </span>
                          <div className="text-xs font-bold leading-tight line-clamp-2 mb-0.5">
                            {course.course_name}
                          </div>
                          <div className="text-[9px] font-medium text-blue-100/90 flex items-start gap-1">
                            <Building className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {course.university?.name}
                            </span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      label: "Study Mode",
                      icon: (
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      ),
                      key: "study_mode",
                    },
                    {
                      label: "Duration",
                      icon: <Clock className="w-3.5 h-3.5 text-blue-500" />,
                      key: "duration",
                    },
                    {
                      label: "Tuition Fee",
                      icon: (
                        <DollarSign className="w-3.5 h-3.5 text-green-500" />
                      ),
                      key: "fee",
                    },
                    {
                      label: "Intake",
                      icon: (
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      ),
                      key: "intake",
                    },
                    {
                      label: "Location",
                      icon: <MapPin className="w-3.5 h-3.5 text-red-500" />,
                      key: "location",
                    },
                    {
                      label: "Rating",
                      icon: <Star className="w-3.5 h-3.5 text-yellow-500" />,
                      key: "rating",
                    },
                  ].map(({ label, icon, key }, rowIdx) => (
                    <tr
                      key={key}
                      className={
                        rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }
                    >
                      <td className="p-3 text-xs font-semibold text-gray-700 sticky left-0 bg-inherit z-10 border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-1.5">
                          {icon} {label}
                        </div>
                      </td>
                      {comparisonCourses.map((course) => (
                        <td
                          key={course.id}
                          className="p-3 text-xs text-gray-800 border-r border-gray-100 last:border-0"
                        >
                          {key === "study_mode" && (course.study_mode || "N/A")}
                          {key === "duration" && (course.duration || "N/A")}
                          {key === "fee" && (
                            <span className="font-bold text-green-700">
                              {course.fee || "N/A"}
                            </span>
                          )}
                          {key === "intake" &&
                            (course.intake
                              ? course.intake.replace(/,/g, ", ")
                              : "N/A")}
                          {key === "location" &&
                            (course.university?.city || "N/A")}
                          {key === "rating" && (
                            <div className="font-semibold text-yellow-700 flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {course.university?.rating || "N/A"}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Apply row */}
                  <tr className="bg-linear-to-r from-blue-50 to-indigo-50">
                    <td className="p-3 text-xs font-bold text-gray-700 sticky left-0 bg-blue-100 z-10 border-r border-gray-200">
                      Apply
                    </td>
                    {comparisonCourses.map((course) => (
                      <td
                        key={course.id}
                        className="p-3 border-r border-gray-100 last:border-0"
                      >
                        <button
                          onClick={() => onApplyNow(course)}
                          disabled={appliedCourses.has(course.id)}
                          className={`w-full py-2.5 px-3 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                            appliedCourses.has(course.id)
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                          }`}
                        >
                          {appliedCourses.has(course.id)
                            ? "Applied ✓"
                            : "Apply Now"}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="bg-white hidden sm:block -mt-10 pt-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-3 font-semibold text-xs uppercase tracking-wider w-1/4 sticky left-0 top-0 bg-blue-700 z-30 border-r border-blue-600 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                  Criteria
                </th>
                {comparisonCourses.map((course) => (
                  <th
                    key={course.id}
                    className="p-3 min-w-[260px] align-top border-r border-blue-600 last:border-0 sticky top-0 bg-blue-700 z-20"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-blue-100 bg-blue-800/60 rounded px-2 py-0.5 w-fit backdrop-blur-sm border border-blue-600">
                        {course.university?.inst_type || "University"}
                      </span>
                      <div
                        className="text-base font-bold leading-tight line-clamp-2"
                        title={course.course_name}
                      >
                        {course.course_name}
                      </div>
                      <div className="text-xs font-medium text-blue-200 flex items-center gap-1">
                        <Building className="w-3 h-3 opacity-70" />{" "}
                        {course.university?.name}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  label: "Study Mode",
                  icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
                  bg: "bg-white",
                  stickyBg: "bg-white",
                  render: (c: any) => c.study_mode || "N/A",
                },
                {
                  label: "Duration",
                  icon: <Clock className="w-4 h-4 text-blue-500" />,
                  bg: "bg-gray-50/40",
                  stickyBg: "bg-gray-50",
                  render: (c: any) => c.duration || "N/A",
                },
                {
                  label: "Tuition Fee",
                  icon: <DollarSign className="w-4 h-4 text-green-500" />,
                  bg: "bg-white",
                  stickyBg: "bg-white",
                  render: (c: any) => (
                    <span className="font-bold">{c.fee || "N/A"}</span>
                  ),
                },
                {
                  label: "Intake",
                  icon: <Calendar className="w-4 h-4 text-purple-500" />,
                  bg: "bg-gray-50/40",
                  stickyBg: "bg-gray-50",
                  render: (c: any) =>
                    c.intake ? c.intake.replace(/,/g, ", ") : "N/A",
                },
                {
                  label: "Location",
                  icon: <MapPin className="w-4 h-4 text-red-500" />,
                  bg: "bg-white",
                  stickyBg: "bg-white",
                  render: (c: any) =>
                    `${c.university?.city}, ${c.university?.state}`,
                },
              ].map(({ label, icon, bg, stickyBg, render }) => (
                <tr
                  key={label}
                  className={`hover:bg-blue-50/30 transition-colors ${bg} group`}
                >
                  <td
                    className={`p-2.5 font-medium text-gray-700 sticky left-0 ${stickyBg} z-10 border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-blue-50/30`}
                  >
                    <div className="flex items-center gap-2">
                      {icon} {label}
                    </div>
                  </td>
                  {comparisonCourses.map((c) => (
                    <td
                      key={c.id}
                      className="p-2.5 text-gray-700 border-r border-gray-100 last:border-0"
                    >
                      {render(c)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Actions row */}
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="p-2.5 font-medium text-gray-700 sticky left-0 bg-gray-50 z-10 border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  Actions
                </td>
                {comparisonCourses.map((c) => (
                  <td
                    key={c.id}
                    className="p-2.5 border-r border-gray-200 last:border-0"
                  >
                    <button
                      onClick={() => onApplyNow(c)}
                      disabled={appliedCourses.has(c.id)}
                      className={`w-full py-2.5 px-4 text-white text-sm rounded-lg font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                        appliedCourses.has(c.id)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                      }`}
                    >
                      {appliedCourses.has(c.id) ? "Applied ✓" : "Apply Now"}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white border-t border-gray-100 flex justify-end rounded-b-xl">
        <button
          onClick={onClose}
          className="px-8 py-2.5 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-colors shadow-lg cursor-pointer"
        >
          Close Window
        </button>
      </div>
    </div>
  </div>
);

export default CourseComparisonModal;
