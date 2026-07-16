// ─── Minimalist Skeleton Loading States ────────────────────

export function CardSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="card-minimal p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-surface-200 rounded dark:bg-surface-700" />
        <div className="h-9 w-9 rounded-lg bg-surface-200 dark:bg-surface-700" />
      </div>
      <div className="h-8 w-32 bg-surface-200 rounded dark:bg-surface-700" />
      <div className="h-3 w-20 bg-surface-200 rounded dark:bg-surface-700" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card-minimal overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
        <div className="flex gap-6">
          {[80, 120, 80, 60, 80].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-surface-200 rounded dark:bg-surface-700"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 border-b border-surface-100 dark:border-surface-800 last:border-0"
        >
          <div className="flex gap-6">
            {[80, 120, 80, 60, 80].map((w, j) => (
              <div
                key={j}
                className="h-3 bg-surface-100 rounded dark:bg-surface-800"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card-minimal p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-5 w-32 bg-surface-200 rounded dark:bg-surface-700" />
              <div className="flex gap-3">
                <div className="h-3 w-12 bg-surface-200 rounded dark:bg-surface-700" />
                <div className="h-3 w-12 bg-surface-200 rounded dark:bg-surface-700" />
              </div>
            </div>
            <div className="h-8 w-8 rounded-lg bg-surface-200 dark:bg-surface-700" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, j) => (
              <div
                key={j}
                className="h-16 w-10 rounded-lg bg-surface-100 dark:bg-surface-800"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card-minimal p-6 animate-pulse">
      <div className="h-3 w-24 bg-surface-200 rounded mb-5 dark:bg-surface-700" />
      <div className="flex items-center gap-6">
        <div className="h-52 w-52 rounded-full bg-surface-100 flex-shrink-0 dark:bg-surface-800" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-surface-200 dark:bg-surface-700" />
              <div className="h-3 flex-1 bg-surface-200 rounded dark:bg-surface-700" />
              <div className="h-3 w-16 bg-surface-200 rounded dark:bg-surface-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Full-page loading states ──────────────────────────────

export function PageLoading() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="animate-pulse space-y-2">
          <div className="h-7 w-36 bg-surface-200 rounded dark:bg-surface-700" />
          <div className="h-4 w-48 bg-surface-100 rounded dark:bg-surface-800" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="space-y-4">
        <div className="h-8 w-32 bg-surface-200 rounded animate-pulse dark:bg-surface-700" />
        <div className="card-minimal p-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-surface-100 rounded dark:bg-surface-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
