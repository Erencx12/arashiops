import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Minus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent, outcome-based pricing for revenue operating systems. Silver from $1,500/mo. No lock-in contracts.",
};

const tiers = [
  {
    name: "Silver",
    price: "$1,500",
    period: "/mo",
    for: "Early-stage businesses building their first structured revenue system.",
    overview:
      "For founders and small teams still running sales manually who need the infrastructure to make growth predictable. This tier deploys a foundational outbound system and CRM setup. Enough to create pipeline visibility and start filling it.",
    deliverables: [
      "Full ICP definition & buyer persona research",
      "2 active outbound campaigns (email-first)",
      "7-touch email sequence per persona",
      "Automated lead qualification workflow",
      "CRM setup & hygiene (up to 5 users)",
      "Performance reporting dashboard",
      "Monthly strategy call (60 min)",
      "Campaign copy & messaging templates",
    ],
    outcomes: [
      "20–50 qualified leads per month by month 3",
      "Structured, visible, trackable pipeline",
      "Reduction of 4–6 hours/week in manual sales work",
      "Clear ICP that the whole team aligns to",
    ],
    support: "Email support (M–F, 24h response) · Monthly review call",
    upgrade: "Upgrade to Gold when pipeline exceeds 40 leads/month or you're ready to add content and multi-channel outreach.",
    highlight: false,
    cta: "Start with Silver",
  },
  {
    name: "Gold",
    price: "$4,500",
    period: "/mo",
    for: "Growing businesses with product-market fit, ready to operate at scale.",
    overview:
      "For companies that need more than outbound. Think content, multi-channel sequences, and a sales process that runs without constant hand-holding. This tier builds the full commercial infrastructure and operates it with you on a weekly basis.",
    deliverables: [
      "Everything in Silver",
      "5 active campaigns (email, LinkedIn, referral)",
      "Content production: 8 pieces per month",
      "LinkedIn outreach sequences",
      "Advanced lead scoring & segmentation",
      "Sales enablement scripts & objection handling guide",
      "Revenue attribution dashboards by channel",
      "Weekly strategy calls (30 min)",
      "Dedicated account manager",
      "A/B testing framework",
    ],
    outcomes: [
      "60–100 qualified leads per month",
      "15–25% improvement in close rate",
      "Full pipeline visibility and weekly reporting",
      "Content driving inbound alongside outbound",
    ],
    support: "Dedicated Slack channel · Weekly syncs · 4h response SLA",
    upgrade: "Upgrade to Platinum for executive-level infrastructure, paid media, and SDR support.",
    highlight: true,
    cta: "Start with Gold",
  },
  {
    name: "Platinum",
    price: "Custom",
    period: "",
    for: "Established businesses building enterprise-grade revenue infrastructure.",
    overview:
      "For companies at $5M+ ARR or those that need the full stack: paid media, fractional SDR support, executive reporting, and custom integrations. Platinum is scoped individually based on your business size, existing systems, and growth targets.",
    deliverables: [
      "Everything in Gold",
      "Unlimited campaigns",
      "Full content operating system (18+ pieces/mo)",
      "Paid media management (LinkedIn, Google)",
      "Fractional SDR / BDR support",
      "Executive revenue reporting & board-ready dashboards",
      "Quarterly business reviews with leadership",
      "Custom CRM integrations (Salesforce, Marketo, etc.)",
      "White-glove onboarding (2-week deployment)",
      "Monthly strategic advisory session (2 hrs)",
    ],
    outcomes: [
      "Enterprise-scale pipeline, scoped to your targets",
      "Full revenue attribution across every channel",
      "Board-level reporting infrastructure",
      "A system that runs with or without us",
    ],
    support: "Dedicated Slack + on-call · Guaranteed SLA · Direct senior team access",
    upgrade: "No upgrade needed. This is the complete operating system.",
    highlight: false,
    cta: "Book a Call",
  },
];

const comparisonRows = [
  { feature: "ICP definition & research", silver: true, gold: true, platinum: true },
  { feature: "Active outbound campaigns", silver: "2", gold: "5", platinum: "Unlimited" },
  { feature: "Email sequences", silver: "1", gold: "3+", platinum: "Unlimited" },
  { feature: "LinkedIn outreach", silver: false, gold: true, platinum: true },
  { feature: "Lead qualification workflow", silver: true, gold: true, platinum: true },
  { feature: "CRM setup & management", silver: true, gold: true, platinum: true },
  { feature: "Content production", silver: false, gold: "8 pieces/mo", platinum: "18+ pieces/mo" },
  { feature: "Lead scoring & segmentation", silver: false, gold: true, platinum: true },
  { feature: "Revenue attribution dashboards", silver: false, gold: true, platinum: true },
  { feature: "Sales enablement scripts", silver: false, gold: true, platinum: true },
  { feature: "Paid media management", silver: false, gold: false, platinum: true },
  { feature: "Fractional SDR support", silver: false, gold: false, platinum: true },
  { feature: "Executive reporting", silver: false, gold: false, platinum: true },
  { feature: "Custom integrations", silver: false, gold: false, platinum: true },
  { feature: "Strategy calls", silver: "Monthly", gold: "Weekly", platinum: "Weekly + advisory" },
  { feature: "Account manager", silver: false, gold: true, platinum: true },
  { feature: "Slack channel", silver: false, gold: true, platinum: true },
  { feature: "Response SLA", silver: "24h", gold: "4h", platinum: "Guaranteed" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check size={16} className="text-[#111111] mx-auto" strokeWidth={2.5} />;
  if (value === false)
    return <Minus size={14} className="text-[#d1d5db] mx-auto" strokeWidth={2} />;
  return (
    <span className="text-[12.5px] font-medium text-[#374151] text-center block">
      {value}
    </span>
  );
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-[1280px] mx-auto">

          {/* Page header */}
          <div className="max-w-[640px] mb-16">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
              Pricing
            </p>
            <h1 className="text-[48px] font-bold tracking-[-0.03em] text-[#111111] leading-[1.08] mb-5">
              Infrastructure-level
              <br />
              engagement.
            </h1>
            <p className="text-[17px] text-[#6b7280] leading-relaxed">
              Every tier is built around measurable outcomes, not deliverable
              lists. Clear scope, defined timelines, and performance you can track
              from week one.
            </p>
          </div>

          {/* Tier overview cards */}
          <div className="grid lg:grid-cols-3 gap-5 mb-20">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border flex flex-col ${
                  tier.highlight
                    ? "bg-[#111111] border-[#111111] shadow-[0_8px_48px_rgba(0,0,0,0.18)]"
                    : "bg-white border-[#e5e7eb]"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-[11px] font-semibold bg-[#4f46e5] text-white px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}
                <div className="p-8 border-b border-white/10 flex-1">
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-4 ${tier.highlight ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>
                    {tier.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className={`text-[40px] font-bold tracking-tight ${tier.highlight ? "text-white" : "text-[#111111]"}`}>
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className={`text-[15px] ${tier.highlight ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className={`text-[13.5px] leading-relaxed mb-6 ${tier.highlight ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>
                    {tier.for}
                  </p>
                  <ul className="space-y-2.5">
                    {tier.deliverables.slice(0, 6).map((d) => (
                      <li key={d} className="flex items-start gap-2.5">
                        <Check size={13} className={`shrink-0 mt-0.5 ${tier.highlight ? "text-[#4f46e5]" : "text-[#111111]"}`} strokeWidth={2.5} />
                        <span className={`text-[13px] ${tier.highlight ? "text-[#d1d5db]" : "text-[#374151]"}`}>{d}</span>
                      </li>
                    ))}
                    {tier.deliverables.length > 6 && (
                      <li className={`text-[12.5px] pl-5 ${tier.highlight ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>
                        +{tier.deliverables.length - 6} more included
                      </li>
                    )}
                  </ul>
                </div>
                <div className="p-8">
                  <Link
                    href={tier.price === "Custom" ? "/book" : "/get-started"}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-[14px] font-medium transition-colors ${
                      tier.highlight
                        ? "bg-white text-[#111111] hover:bg-[#f3f4f6]"
                        : "bg-[#111111] text-white hover:bg-[#1a1a1a]"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed tier breakdowns */}
          <div className="mb-20">
            <h2 className="text-[28px] font-bold tracking-[-0.025em] text-[#111111] mb-10">
              What&apos;s included in each tier
            </h2>
            <div className="space-y-6">
              {tiers.map((tier, i) => (
                <div key={tier.name} className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                  <div className="px-8 py-6 border-b border-[#e5e7eb] bg-[#fafafa] flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">
                        {["Entry", "Growth", "Enterprise"][i]}
                      </p>
                      <h3 className="text-[20px] font-bold text-[#111111] tracking-tight">
                        {tier.name}
                        {tier.period && (
                          <span className="text-[16px] font-normal text-[#6b7280] ml-2">
                            {tier.price}{tier.period}
                          </span>
                        )}
                        {!tier.period && (
                          <span className="text-[16px] font-normal text-[#6b7280] ml-2">
                            Custom pricing
                          </span>
                        )}
                      </h3>
                    </div>
                    <Link
                      href={tier.price === "Custom" ? "/book" : "/get-started"}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
                    >
                      {tier.cta}
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr] divide-x divide-y md:divide-y-0 divide-[#e5e7eb]">
                    {/* Overview */}
                    <div className="px-7 py-6">
                      <p className="text-[10.5px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-3">
                        Overview
                      </p>
                      <p className="text-[13px] text-[#374151] leading-relaxed">{tier.overview}</p>
                    </div>
                    {/* Deliverables */}
                    <div className="px-7 py-6">
                      <p className="text-[10.5px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-3">
                        Deliverables
                      </p>
                      <ul className="space-y-1.5">
                        {tier.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2">
                            <Check size={11} className="text-[#9ca3af] shrink-0 mt-0.5" />
                            <span className="text-[12.5px] text-[#374151]">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Outcomes */}
                    <div className="px-7 py-6">
                      <p className="text-[10.5px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-3">
                        Expected Outcomes
                      </p>
                      <ul className="space-y-2">
                        {tier.outcomes.map((o) => (
                          <li key={o} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#9ca3af] mt-[7px] shrink-0" />
                            <span className="text-[12.5px] text-[#374151] leading-relaxed">{o}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                        <p className="text-[10.5px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-2">
                          Support
                        </p>
                        <p className="text-[12px] text-[#6b7280] leading-relaxed">{tier.support}</p>
                      </div>
                    </div>
                    {/* Upgrade path */}
                    <div className="px-7 py-6">
                      <p className="text-[10.5px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-3">
                        Upgrade Path
                      </p>
                      <p className="text-[12.5px] text-[#374151] leading-relaxed">{tier.upgrade}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison table */}
          <div className="mb-20">
            <h2 className="text-[28px] font-bold tracking-[-0.025em] text-[#111111] mb-8">
              Feature comparison
            </h2>
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <div className="border border-[#e5e7eb] rounded-xl overflow-hidden min-w-[560px]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_100px_100px] border-b border-[#e5e7eb] bg-[#fafafa]">
                <div className="px-6 py-3.5" />
                {["Silver", "Gold", "Platinum"].map((tier, i) => (
                  <div key={tier} className={`px-4 py-3.5 text-center border-l border-[#e5e7eb] ${i === 1 ? "bg-[#111111]" : ""}`}>
                    <span className={`text-[12px] font-semibold ${i === 1 ? "text-white" : "text-[#111111]"}`}>
                      {tier}
                    </span>
                  </div>
                ))}
              </div>
              {/* Rows */}
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-[1fr_100px_100px_100px] border-b border-[#e5e7eb] last:border-b-0 ${
                    i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                  }`}
                >
                  <div className="px-6 py-3 flex items-center">
                    <span className="text-[13px] text-[#374151]">{row.feature}</span>
                  </div>
                  {[row.silver, row.gold, row.platinum].map((val, j) => (
                    <div
                      key={j}
                      className={`px-4 py-3 flex items-center justify-center border-l border-[#e5e7eb] ${
                        j === 1 ? "bg-[#111111]/[0.03]" : ""
                      }`}
                    >
                      <CellValue value={val} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border border-[#e5e7eb] rounded-xl p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-[22px] font-bold tracking-tight text-[#111111] mb-2">
                Not sure which tier is right for you?
              </h3>
              <p className="text-[15px] text-[#6b7280] max-w-[440px]">
                Book a 45-minute discovery call. We&apos;ll assess your current
                state and recommend the right starting point.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e5e7eb] text-[#374151] text-[14px] font-medium rounded-md hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-colors"
              >
                Book a Call
              </Link>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
              >
                Get Started
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
