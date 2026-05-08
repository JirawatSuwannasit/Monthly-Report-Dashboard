export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-4 animate-pulse">
      <div className="h-5 w-40 bg-slate-200 rounded" />
      <div className="flex-1 bg-slate-100 rounded-xl flex items-end gap-2 px-4 pb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-200 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}
