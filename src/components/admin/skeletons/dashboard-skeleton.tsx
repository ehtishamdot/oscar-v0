'use client';

import { StatsGridSkeleton } from './stats-card-skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid */}
      <StatsGridSkeleton count={4} />

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
