export default function AdminLoading() {
  return (
    <div className="px-8 py-8">
      <div className="h-7 w-36 bg-[#f3f4f6] rounded animate-pulse mb-1" />
      <div className="h-4 w-48 bg-[#f3f4f6] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-[#e5e7eb] rounded-xl p-5 bg-white">
            <div className="h-3 w-24 bg-[#f3f4f6] rounded animate-pulse mb-3" />
            <div className="h-7 w-16 bg-[#f3f4f6] rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-[#f3f4f6] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <div className="h-4 w-28 bg-[#f3f4f6] rounded animate-pulse" />
              </div>
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="px-5 py-3.5 flex items-center gap-3 border-b border-[#f3f4f6]">
                  <div className="w-7 h-7 rounded-full bg-[#f3f4f6] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 bg-[#f3f4f6] rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-[#f3f4f6] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <div className="h-4 w-32 bg-[#f3f4f6] rounded animate-pulse" />
            </div>
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="px-5 py-3.5 border-b border-[#f3f4f6]">
                <div className="h-3 w-full bg-[#f3f4f6] rounded animate-pulse mb-1.5" />
                <div className="h-2.5 w-24 bg-[#f3f4f6] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
