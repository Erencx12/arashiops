"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-8 py-8">
      <div className="border border-red-100 rounded-xl p-8 bg-red-50 text-center max-w-md">
        <p className="text-[14px] font-semibold text-red-800 mb-2">Failed to load data</p>
        <p className="text-[12.5px] text-red-600 mb-5">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
