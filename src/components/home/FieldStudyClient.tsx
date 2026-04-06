'use client'

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Globe,
  Filter,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton, FieldStudySkeleton } from "../ui/Skeleton";

interface YearItem {
  category_id: number;
  category: string;
  slug: string;
  count: number;
  color: string;
}

interface YearData {
  year: number;
  total: number;
  items: YearItem[];
}

interface StatsData {
  overall_total: number;
  years: YearData[];
}

const FIELD_COLOR_PALETTE = [
  "bg-emerald-400",
  "bg-orange-400",
  "bg-blue-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-cyan-400",
  "bg-lime-400",
  "bg-rose-400",
  "bg-amber-400",
  "bg-indigo-400",
];

function normalizeFieldColor(input: string | undefined, seed: number) {
  const raw = String(input || "").trim();
  const invalid =
    !raw ||
    /white|gray|slate|neutral|zinc|stone|transparent/i.test(raw) ||
    !raw.startsWith("bg-");
  if (!invalid) return raw;
  const idx = Math.abs(Number(seed) || 0) % FIELD_COLOR_PALETTE.length;
  return FIELD_COLOR_PALETTE[idx];
}

function categoryColorOverride(category: string | undefined) {
  const c = String(category || "").trim().toLowerCase();
  if (c === "education" || c === "engineering") return "bg-yellow-400";
  return null;
}

export default function FieldStudyClient() {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [yearsRes, statsRes] = await Promise.all([
          fetch('/api/emgs/years').then(res => res.json()),
          fetch('/api/emgs/stats').then(res => res.json())
        ]);

        if (yearsRes.error) throw new Error(yearsRes.error);
        if (statsRes.error) throw new Error(statsRes.error);

        const yearsData = yearsRes.data || [];
        setYears(yearsData);
        setSelectedYears(yearsData);
        const rawStats = statsRes.data as StatsData;
        const normalizedStats: StatsData = {
          ...rawStats,
          years: (rawStats?.years || []).map((yearData) => ({
            ...yearData,
            items: (yearData?.items || []).map((item) => ({
              ...item,
              color: categoryColorOverride(item.category) || normalizeFieldColor(item.color, item.category_id),
            })),
          })),
        };
        setStatsData(normalizedStats);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -296, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 296, behavior: "smooth" });
    }
  };

  // Filter years based on selection
  const filteredYearsData = useMemo(() => {
    if (!statsData || !statsData.years) return [];
    return statsData.years.filter((yearData) =>
      selectedYears.includes(yearData.year),
    );
  }, [selectedYears, statsData]);

  // Calculate total applications
  const totalApplications = useMemo(() => {
    return filteredYearsData.reduce((sum, yearData) => sum + yearData.total, 0);
  }, [filteredYearsData]);

  // Get all unique categories across all years
  const allCategories = useMemo(() => {
    if (!statsData || !statsData.years) return [];
    const catMap = new Map();

    statsData.years.forEach((yearData) => {
      yearData.items.forEach((item) => {
        if (!catMap.has(item.category_id)) {
          catMap.set(item.category_id, {
            id: item.category_id,
            name: item.category,
            slug: item.slug,
            color: item.color,
          });
        }
      });
    });

    return Array.from(catMap.values()).sort((a, b) => a.id - b.id);
  }, [statsData]);

  const toggleYear = (year: number) => {
    setSelectedYears((prev) => {
      if (prev.length === years.length) {
        return [year];
      }
      if (prev.length === 1 && prev.includes(year)) {
        return [...years].sort();
      }
      if (prev.includes(year)) {
        const newSelection = prev.filter((y) => y !== year);
        return newSelection.length > 0 ? newSelection : [year];
      }
      return [...prev, year].sort();
    });
  };

  if (loading) {
    return <FieldStudySkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">
            {error || "Failed to load data"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-[#003893] to-[#003893] rounded-xl mb-3 sm:mb-4 shadow-lg">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
              Top Study Areas Preferred by International Students
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto px-4">
              Distribution by Field of Study for New Application Received (
              {years.length > 0
                ? `${Math.min(...years)} - ${Math.max(...years)}`
                : "N/A"}
              )
            </p>
          </div>

          {/* Year Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white/90 transition-all duration-200 shadow-md text-sm sm:text-base"
            >
              <Filter className="w-4 h-4" />
              Filter Years
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <BarChart3 className="w-4 h-4" />
              {selectedYears.length} of {years.length} years selected
            </div>
          </div>

          {/* Year Selection */}
          <div
            className={`transition-all duration-300 overflow-hidden ${showFilters ? "max-h-96 mt-4" : "max-h-0"}`}
          >
            <div className="overflow-x-auto p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-lg shadow-md scrollbar-hide">
              <div className="flex justify-center gap-2 min-w-max">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedYears.includes(year)
                        ? "bg-linear-to-r from-[#003893] to-[#003893] text-white shadow-lg transform scale-105"
                        : "bg-white/80 text-gray-600 border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto px-4 mt-4 text-center">
            Source: Education Malaysia Global Services (EMGS) – Official Website
            Data compiled from publicly available information.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-10">
        {/* Summary */}
        {selectedYears.length > 0 && (
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {totalApplications.toLocaleString()} Total Applications
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              Across {selectedYears.length} years ({Math.min(...selectedYears)}{" "}
              - {Math.max(...selectedYears)})
            </p>
          </div>
        )}

        {/* Legend */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm px-2">
            {allCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${cat.color} rounded shadow-sm`}
                ></div>
                <span className="font-medium text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Year Cards with Arrows */}
        {filteredYearsData.length > 0 ? (
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-[#003893] hover:text-white transition-all duration-300 border border-gray-200 group"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-white" />
            </button>

            {/* Cards Container - No visible scrollbar */}
            <div
              ref={scrollRef}
              className="overflow-x-scroll mx-10 sm:mx-14 scrollbar-hide"
            >
              <div className="flex gap-4 sm:gap-6">
                {filteredYearsData.map((yearData) => (
                  <div
                    key={yearData.year}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition w-[260px] sm:w-[280px] shrink-0"
                  >
                    <div className="text-center mb-3 sm:mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          {yearData.year}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Total: {yearData.total.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {yearData.items.map((item, idx) => (
                        <div
                          key={`${yearData.year}-${item.category_id}-${idx}`}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${item.color} rounded`}
                            ></div>
                            <span className="text-xs text-gray-600 truncate">
                              {item.category || "N/A"}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {item.count.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-[#003893] hover:text-white transition-all duration-300 border border-gray-200 group"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-white" />
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No data available for selected years
            </p>
          </div>
        )}

        {/* Horizontal Chart */}
        {filteredYearsData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-lg overflow-x-auto">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-4 text-center">
              Field Distribution by Year
            </h3>
            <div className="space-y-4 sm:space-y-6 min-w-[1000px] sm:min-w-0">
              {filteredYearsData.map((yearData) => (
                <div
                  key={yearData.year}
                  className="flex items-center gap-3 sm:gap-6"
                >
                  <div className="w-20 sm:w-24 text-base sm:text-lg font-bold text-gray-700 flex items-center shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    {yearData.year}
                  </div>
                  <div className="flex-1">
                    <div className="flex h-10 sm:h-12 bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                      {yearData.items.map((item, idx) => (
                        <div
                          key={`chart-${yearData.year}-${item.category_id}-${idx}`}
                          className={`${item.color} flex items-center justify-center text-gray-800 text-[10px] sm:text-sm font-semibold transition hover:brightness-110 cursor-pointer overflow-hidden`}
                          style={{
                            width: `${(item.count / yearData.total) * 100}%`,
                          }}
                          title={`${item.category || "Unknown"}: ${item.count.toLocaleString()}`}
                        >
                          {/* Only show count if bar is wide enough to avoid clutter */}
                          {(item.count / yearData.total) * 100 > 3 && (
                            <span className="px-1 truncate">
                              {item.count.toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-20 sm:w-28 text-right text-base sm:text-lg font-bold text-gray-700 shrink-0">
                    {yearData.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary by Field */}
        {allCategories.length > 0 && totalApplications > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
            {allCategories
              .map((cat) => {
                const total = filteredYearsData.reduce((sum, yearData) => {
                  const item = yearData.items.find(
                    (i) => i.category_id === cat.id,
                  );
                  return sum + (item ? item.count : 0);
                }, 0);

                if (total === 0) return null;
                const percentage = ((total / totalApplications) * 100).toFixed(
                  1,
                );

                return {
                  cat,
                  total,
                  percentage,
                };
              })
              .filter(Boolean)
              .map((item) => {
                if (!item) return null;
                const { cat, total, percentage } = item;
                return (
                  <div
                    key={cat.id}
                    className="bg-white/90 backdrop-blur rounded-2xl p-3 sm:p-4 shadow hover:shadow-md transition-all flex flex-col items-center justify-center border border-gray-100 group"
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${cat.color} rounded-lg mb-2 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center`}
                    >
                      <span className="text-white text-xs font-bold">
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                      {total.toLocaleString()}
                    </div>
                    <div className="text-[10px] sm:text-xs text-center text-gray-500 font-medium line-clamp-2 mt-1 px-1 h-8 flex items-center justify-center">
                      {cat.name || "Unknown"}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Trends */}
        {filteredYearsData.length > 1 && (
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-r from-[#003893] to-[#003893] rounded-xl mb-3 sm:mb-4 shadow-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Key Insights & Trends
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Analysis of field preferences over time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {(() => {
                const firstYear = filteredYearsData[0];
                const lastYear =
                  filteredYearsData[filteredYearsData.length - 1];

                const socialSciFirst = firstYear.items.find(
                  (i) => i.slug === "social-sciences",
                );
                const socialSciLast = lastYear.items.find(
                  (i) => i.slug === "social-sciences",
                );
                const scienceFirst = firstYear.items.find(
                  (i) => i.slug === "science",
                );
                const scienceLast = lastYear.items.find(
                  (i) => i.slug === "science",
                );

                return (
                  <>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">
                        {socialSciFirst && socialSciLast && socialSciFirst.count > 0
                          ? Math.round(
                              ((socialSciLast.count - socialSciFirst.count) /
                                socialSciFirst.count) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 font-medium">
                        Social Sciences Growth
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Since {firstYear.year}
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                        {scienceFirst && scienceLast && scienceFirst.count > 0
                          ? Math.round(
                              ((scienceLast.count - scienceFirst.count) /
                                scienceFirst.count) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 font-medium">
                        Science & Computing Growth
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Since {firstYear.year}
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                        {selectedYears.length}
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 font-medium">
                        Years of Data
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Comprehensive tracking
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Footer Section - New in 1:1 Sync */}
      <div className="bg-linear-to-r from-gray-50 to-blue-50 border-t border-gray-200 mt-12 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-[#003893] to-[#003893] rounded-2xl mb-4 sm:mb-6 shadow-xl">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Education Malaysia Global Services
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-10 max-w-3xl mx-auto px-4">
            Comprehensive data insights into international student applications
            and field of study preferences in Malaysia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50">
              <div className="text-2xl sm:text-3xl font-bold text-[#003893] mb-2">
                {years.length}
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-medium">
                Years of Data
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                {allCategories.length}
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-medium">
                Fields of Study
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">
                {statsData?.overall_total?.toLocaleString() || 0}
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-medium">
                Total Applications
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
