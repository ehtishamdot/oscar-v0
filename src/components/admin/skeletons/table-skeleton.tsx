'use client';

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
