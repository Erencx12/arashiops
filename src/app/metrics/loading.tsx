export default function MetricsLoading() {
  return (
    <div className="px-8 py-8">
      <div className="h-7 w-24 bg-[#f3f4f6] rounded animate-pulse mb-1" />
      <div className="h-4 w-48 bg-[#f3f4f6] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-[#e5e7eb] rounded-xl p-5 bg-white">
            <div className="h-3 w-20 bg-[#f3f4f6] rounded animate-pulse mb-3" />
            <div className="h-7 w-14 bg-[#f3f4f6] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="border border-[#e5e7eb] rounded-xl p-6 bg-white h-[220px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
