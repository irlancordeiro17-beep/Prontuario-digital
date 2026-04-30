// Skeleton loader for the search page
export default function SearchLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-7 w-64 bg-slate-800 rounded mb-2" />
        <div className="h-4 w-96 bg-slate-800/60 rounded" />
      </div>
      {/* Search bar */}
      <div className="h-12 w-full bg-slate-800 rounded-xl mb-4" />
      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-20 bg-slate-800 rounded-full" />
        ))}
      </div>
      {/* Result cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-slate-800/50 rounded-xl border border-slate-800" />
        ))}
      </div>
    </div>
  )
}
