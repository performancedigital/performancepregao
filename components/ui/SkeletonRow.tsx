export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 border-b border-white/5">
      <div className="h-4 bg-white/10 rounded w-1/4" />
      <div className="h-4 bg-white/10 rounded w-1/5" />
      <div className="h-4 bg-white/10 rounded w-1/6" />
      <div className="h-4 bg-white/10 rounded w-1/6" />
      <div className="h-4 bg-white/10 rounded w-20 ml-auto" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-white/10 rounded w-24" />
          <div className="h-5 bg-white/10 rounded w-4/5" />
          <div className="h-5 bg-white/10 rounded w-3/5" />
        </div>
        <div className="h-7 w-7 bg-white/10 rounded-lg flex-shrink-0" />
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-3 bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/10 rounded w-1/3" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div>
          <div className="h-2 bg-white/10 rounded w-16 mb-1.5" />
          <div className="h-5 bg-white/10 rounded w-28" />
        </div>
        <div className="h-8 bg-white/10 rounded-lg w-24" />
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="animate-pulse glass rounded-xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-white/10 rounded w-28" />
        <div className="w-10 h-10 bg-white/10 rounded-xl" />
      </div>
      <div className="h-8 bg-white/10 rounded w-24 mb-2" />
      <div className="h-3 bg-white/10 rounded w-20" />
    </div>
  )
}
