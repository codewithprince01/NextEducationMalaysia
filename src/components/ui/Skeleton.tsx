import React from "react";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
};

export const FieldStudySkeleton = () => {
  return (
    <div className="min-h-[800px] bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-8 text-center">
        <Skeleton className="w-16 h-16 rounded-xl mx-auto mb-4" />
        <Skeleton className="h-8 w-1/2 mx-auto mb-3" />
        <Skeleton className="h-4 w-1/3 mx-auto" />

        <div className="flex justify-center gap-4 mt-6">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Year Cards Skeleton */}
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/40 rounded-xl p-6 shadow-sm w-72 shrink-0"
            >
              <Skeleton className="h-6 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white/40 rounded-2xl p-8 shadow-sm">
          <Skeleton className="h-6 w-48 mx-auto mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white/40 h-32 rounded-2xl p-3 flex flex-col items-center justify-center"
            >
              <Skeleton className="w-10 h-10 rounded-lg mb-2" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
