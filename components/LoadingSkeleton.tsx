'use client';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="card-surface animate-pulse">
          <div className="aspect-[4/3] bg-slate-800 rounded-t-2xl" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-2 bg-slate-800 rounded w-20" />
              <div className="h-2 bg-slate-800 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
