export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton />
    </div>
  );
}
