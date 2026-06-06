import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Props = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  sub?: string;
};

export function StatCard({ label, value, change, trend, sub }: Props) {
  return (
    <div className="border border-[#e5e7eb] rounded-xl p-5 bg-white">
      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">
        {label}
      </p>
      <p className="text-[28px] font-bold text-[#111111] tracking-tight leading-none mb-2">
        {value}
      </p>
      {(change || sub) && (
        <div className="flex items-center gap-1.5">
          {trend === "up" && <TrendingUp size={11} className="text-emerald-500 shrink-0" />}
          {trend === "down" && <TrendingDown size={11} className="text-red-500 shrink-0" />}
          {trend === "neutral" && <Minus size={11} className="text-[#9ca3af] shrink-0" />}
          <p className={`text-[12px] ${
            trend === "up" ? "text-emerald-600" :
            trend === "down" ? "text-red-500" :
            "text-[#9ca3af]"
          }`}>
            {change ?? sub}
          </p>
        </div>
      )}
    </div>
  );
}
