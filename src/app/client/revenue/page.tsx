import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

export const metadata = { title: "Revenue Dashboard" };

// This page is locked for Gold — show upgrade gate
// For Platinum clients it would show full revenue data
const IS_PLATINUM = false;

const platinumData = {
  roas: "4.2×",
  cac: "$38",
  revenueGenerated: "$142,000",
  pipelineValue: "$380,000",
  closedWon: "$67,500",
};

export default function RevenuePage() {
  if (!IS_PLATINUM) {
    return (
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Revenue Dashboard</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Platinum tier only</p>
        </div>

        {/* Blurred preview */}
        <div className="relative mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 blur-sm pointer-events-none select-none" aria-hidden>
            <StatCard label="ROAS"              value="4.2×"      change="+0.8× vs last month" trend="up" />
            <StatCard label="Customer CAC"      value="$38"       change="−$12 vs baseline" trend="up" />
            <StatCard label="Revenue Generated" value="$142K"     change="This quarter" trend="up" />
            <StatCard label="Pipeline Value"    value="$380K"     change="Open opportunities" trend="neutral" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border border-[#e5e7eb] rounded-2xl bg-white px-8 py-6 text-center shadow-sm max-w-[360px]">
              <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
                <Lock size={16} className="text-[#374151]" />
              </div>
              <p className="text-[15px] font-bold text-[#111111] mb-2">Platinum Feature</p>
              <p className="text-[13px] text-[#6b7280] leading-relaxed mb-5">
                The Revenue Dashboard tracks ROAS, CAC, closed revenue, and pipeline value. Available on Platinum engagements.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
              >
                Upgrade to Platinum
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* What Platinum includes */}
        <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">
            What Platinum includes
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Revenue Dashboard",      desc: "ROAS, CAC, pipeline value, and closed revenue tracked monthly." },
              { label: "Finance Reports",         desc: "Monthly financial summaries with attribution to Arashi OPS's work." },
              { label: "Paid Media Management",   desc: "Full paid social and search management with weekly reporting." },
              { label: "Fractional SDR Support",  desc: "Dedicated outreach resource alongside your system." },
              { label: "Executive Reporting",     desc: "Board-ready performance decks delivered monthly." },
              { label: "Custom Integrations",     desc: "Bespoke CRM and data infrastructure tailored to your stack." },
            ].map((f) => (
              <div key={f.label} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d1d5db] mt-[6px] shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#374151]">{f.label}</p>
                  <p className="text-[12.5px] text-[#9ca3af] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Platinum view (future)
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Revenue Dashboard</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">Platinum engagement · Q2 2026</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="ROAS"              value={platinumData.roas}              change="+0.8× vs last month" trend="up" />
        <StatCard label="Customer CAC"      value={platinumData.cac}               change="−$12 vs baseline" trend="up" />
        <StatCard label="Revenue Generated" value={platinumData.revenueGenerated}  change="This quarter" trend="up" />
        <StatCard label="Pipeline Value"    value={platinumData.pipelineValue}     change="Open opportunities" trend="neutral" />
      </div>
    </div>
  );
}
