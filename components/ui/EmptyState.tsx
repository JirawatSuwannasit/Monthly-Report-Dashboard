export function EmptyState({ message = 'No data matches your current filters.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400 gap-3">
      <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 48 48" stroke="currentColor">
        <circle cx="24" cy="24" r="20" strokeWidth="2" />
        <path d="M16 24h16M24 16v16" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
