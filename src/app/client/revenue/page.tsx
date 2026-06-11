import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { verifyClientSession } from "@/lib/dal";
import { getClientById } from "@/lib/queries";

export const metadata = { title: "Revenue Dashboard" };

export default async function RevenuePage() {
  const { clientId } = await verifyClientSession();
  const client = await getClientById(clientId);
  const tier = client?.tier ?? "Silver";
  const isUnlocked = tier === "Gold" || tier === "Enterprise";

  if (!isUnlocked) {
    return (
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Revenue Dashboard</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Gold & Enterprise only</p>
        </div>

        {/* Blurred preview */}
        <div className="relative mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 blur-sm pointer-events-none select-none" aria-hidden>
            <StatCard label="ROAS"              value="4.2×"   change="+0.8× vs last month" trend="up" />
            <StatCard label="Customer CAC"      value="$38"    change="−$12 vs baseline" trend="up" />
            <StatCard label="Revenue Generated" value="$142K"  change="This quarter" trend="up" />
            <StatCard label="Pipeline Value"    value="$380K"  change="Open opportunities" trend="neutral" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border border-[#e5e7eb] rounded-2xl bg-white px-8 py-6 text-center shadow-sm max-w-[360px]">
              <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
                <Lock size={16} className="text-[#374151]" />
              </div>
              <p className="text-[15px] font-bold text-[#111111] mb-2">Gold Feature</p>
              <p className="text-[13px] text-[#6b7280] leading-relaxed mb-5">
                The Revenue Dashboard tracks ROAS, CAC, closed revenue, and pipeline value. Available on Gold and Enterprise plans.
              </p>
              <Link
                href="/client/billing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
              >
                Upgrade Plan
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">
            What Gold & Enterprise includes
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Revenue Dashboard",     desc: "ROAS, CAC, pipeline value, and closed revenue tracked monthly." },
              { label: "Finance Reports",        desc: "Monthly financial summaries with attribution to Arashi OPS's work." },
              { label: "Paid Media Management",  desc: "Full paid social and search management with weekly reporting." },
              { label: "Fractional SDR Support", desc: "Dedicated outreach resource alongside your system." },
              { label: "Executive Reporting",    desc: "Board-ready performance decks delivered monthly." },
              { label: "Custom Integrations",    desc: "Bespoke CRM and data infrastructure tailored to your stack." },
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

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Revenue Dashboard</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">{tier} engagement · Q2 2026</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="ROAS"              value="4.2×"   change="+0.8× vs last month" trend="up" />
        <StatCard label="Customer CAC"      value="$38"    change="−$12 vs baseline" trend="up" />
        <StatCard label="Revenue Generated" value="$142K"  change="This quarter" trend="up" />
        <StatCard label="Pipeline Value"    value="$380K"  change="Open opportunities" trend="neutral" />
      </div>
    </div>
  );
}
