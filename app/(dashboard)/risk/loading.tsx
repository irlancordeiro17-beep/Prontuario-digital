// Skeleton loader for the risk dashboard
export default function RiskLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-pulse">
      <div className="h-7 w-56 bg-slate-800 rounded mb-6" />
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800 rounded-xl" />
        ))}
      </div>
      {/* Risk list */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl border border-slate-800" />
        ))}
      </div>
    </div>
  )
}
