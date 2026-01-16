'use client';

export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="mt-4">
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="mt-2">
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
