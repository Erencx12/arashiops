export default function ClientLoading() {
  return (
    <div className="px-8 py-8">
      <div className="h-7 w-48 bg-[#f3f4f6] rounded animate-pulse mb-1" />
      <div className="h-4 w-36 bg-[#f3f4f6] rounded animate-pulse mb-8" />
      <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white mb-6">
        <div className="grid md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-2.5 w-16 bg-[#f3f4f6] rounded animate-pulse mb-2" />
              <div className="h-5 w-24 bg-[#f3f4f6] rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-[#f3f4f6] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white h-[300px] animate-pulse" />
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white h-[200px] animate-pulse" />
      </div>
    </div>
  );
}
