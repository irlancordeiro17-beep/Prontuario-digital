// Skeleton loader for analytics page
export default function AnalyticsLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-pulse">
      <div className="h-7 w-80 bg-slate-800 rounded mb-2" />
      <div className="h-4 w-64 bg-slate-800/60 rounded mb-8" />
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800 rounded-xl" />
        ))}
      </div>
      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="h-64 bg-slate-800 rounded-xl" />
        <div className="lg:col-span-2 h-64 bg-slate-800 rounded-xl" />
      </div>
      {/* Line chart */}
      <div className="h-64 bg-slate-800 rounded-xl mb-6" />
      {/* Table */}
      <div className="h-48 bg-slate-800 rounded-xl" />
    </div>
  )
}
