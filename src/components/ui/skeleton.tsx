import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#f3f4f6]",
        className
      )}
    />
  );
}

export function PricingCardSkeleton() {
  return (
    <div className="border border-[#e5e7eb] rounded-xl p-8 flex flex-col gap-5">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="space-y-2.5 mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full mt-4 rounded-md" />
    </div>
  );
}

export function CaseStudyCardSkeleton() {
  return (
    <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
      <div className="px-7 py-5 border-b border-[#e5e7eb] flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-7 py-6 border-r last:border-r-0 border-[#e5e7eb] space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}
