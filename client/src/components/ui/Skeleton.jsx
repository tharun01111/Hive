export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-notion bg-neutral-100 dark:bg-neutral-800 ${className}`}
    />
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex h-full gap-3 overflow-hidden p-6">
      {[0, 1, 2].map((column) => (
        <div
          key={column}
          className="w-72 shrink-0 rounded-notion border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex items-start gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
