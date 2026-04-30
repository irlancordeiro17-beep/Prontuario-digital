// Skeleton loader for citizen detail page
export default function CitizenLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-pulse">
      {/* Back link */}
      <div className="h-4 w-24 bg-slate-800 rounded mb-6" />
      {/* Header card */}
      <div className="h-40 bg-slate-800 rounded-xl mb-6" />
      {/* Tab row */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 bg-slate-800 rounded-lg" />
        ))}
      </div>
      {/* Content blocks */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-xl border border-slate-800" />
        ))}
      </div>
    </div>
  )
}
