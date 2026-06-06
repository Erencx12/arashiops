import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Minus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent, outcome-based pricing for outbound revenue infrastructure. Outbound Foundation from $1,500/mo. No lock-in contracts.",
};

const tiers = [
  {
    name: "Outbound Foundation",
    badge: "Silver",
    price: "$1,500",
    period: "/mo",
    for: "B2B companies building their first structured outbound acquisition system.",
    overview:
      "For founders and sales teams running outreach manually who need real infrastructure to make pipeline predictable. This tier builds the foundational outbound system: ICP, verified lists, multi-touch campaigns, and CRM routing. Enough to create consistent qualified meeting flow.",
    deliverables: [
      "ICP definition & buyer persona research",
      "Verified prospect lists (built to spec)",
      "2 cold email domains (configured & warmed)",
      "2 active outreach campaigns",
      "7-touch email sequences per persona",
      "CRM routing setup",
      "Monthly optimization review",
      "Monthly performance reporting",
    ],
    outcomes: [
      "20–40 qualified meetings per month by month 3",
      "Structured, visible, and trackable pipeline",
      "Reduction of 8–12 hours/week in manual prospecting",
      "Verified ICP that the whole team aligns to",
    ],
    support: "Email support (M–F, 24h response) · Monthly review call",
    upgrade: "Upgrade to Revenue Infrastructure when pipeline exceeds 40 meetings/month or you need qualification automation and multi-domain scale.",
    highlight: false,
    cta: "Start with Silver",
    ctaHref: "/get-started",
  },
  {
    name: "Revenue Infrastructure",
    badge: "Gold",
    price: "$4,500",
    period: "/mo",
    for: "Revenue-focused teams ready to scale pipeline with full outbound infrastructure.",
    overview:
      "For companies that need more than basic outbound. Think multi-domain infrastructure, automated lead qualification, reply categorization, and a system that routes sales-ready leads directly into your CRM. This tier operates the full outbound engine with weekly optimization cycles.",
    deliverables: [
      "Everything in Outbound Foundation",
      "5 active campaigns",
      "Multi-domain infrastructure",
      "Claude lead qualification layer",
      "Reply categorization & routing",
      "Automated CRM routing with context",
      "Sales enablement frameworks",
      "Revenue attribution dashboard",
      "Weekly optimization reviews",
      "Dedicated account manager",
    ],
    outcomes: [
      "50–100 qualified meetings per month",
      "Automated qualification reducing sales cycle by 30–50%",
      "Full pipeline visibility with weekly attribution reporting",
      "Sales team working pre-qualified, context-rich leads only",
    ],
    support: "Dedicated Slack channel · Weekly syncs · 4h response SLA",
    upgrade: "Upgrade to Enterprise for custom automation, advanced CRM integrations, and dedicated strategy support.",
    highlight: true,
    cta: "Start with Gold",
    ctaHref: "/get-started",
  },
  {
    name: "Enterprise",
    badge: "Enterprise",
    price: "Custom",
    period: "",
    for: "Companies requiring deeper automation, CRM integrations, and multi-channel acquisition systems.",
    overview:
      "Custom revenue infrastructure scoped to your business. For companies with complex CRM environments, multi-channel acquisition needs, or requiring dedicated strategy and onboarding support beyond standard tiers.",
    deliverables: [
      "Everything in Gold",
      "Multi-workflow automation",
      "Advanced CRM integrations",
      "Custom reporting & attribution",
      "Dedicated strategy support",
      "Enterprise onboarding & consulting",
    ],
    outcomes: [
      "Custom pipeline targets scoped to your business",
      "Full-stack automation across every acquisition channel",
      "Board-level attribution and reporting infrastructure",
      "A system that runs independently long-term",
    ],
    support: "Dedicated Slack + on-call · Guaranteed SLA · Direct senior team access",
    upgrade: "No upgrade path — this is the complete operating system.",
    highlight: false,
    cta: "Schedule Strategy Call",
    ctaHref: "/book",
  },
];

const comparisonRows = [
  { feature: "ICP definition & research", silver: true, gold: true, enterprise: true },
  { feature: "Verified prospect lists", silver: true, gold: true, enterprise: true },
  { feature: "Cold email domains", silver: "2", gold: "5+", enterprise: "Custom" },
  { feature: "Active outbound campaigns", silver: "2", gold: "5", enterprise: "Unlimited" },
  { feature: "Email sequences (7-touch)", silver: true, gold: true, enterprise: true },
  { feature: "Multi-domain infrastructure", silver: false, gold: true, enterprise: true },
  { feature: "Multi-workflow automation", silver: false, gold: false, enterprise: true },
  { feature: "Claude lead qualification", silver: false, gold: true, enterprise: true },
  { feature: "Reply categorization & routing", silver: false, gold: true, enterprise: true },
  { feature: "CRM routing setup", silver: true, gold: true, enterprise: true },
  { feature: "Advanced CRM integrations", silver: false, gold: false, enterprise: true },
  { feature: "Sales enablement frameworks", silver: false, gold: true, enterprise: true },
  { feature: "Revenue attribution dashboard", silver: false, gold: true, enterprise: true },
  { feature: "Custom reporting & attribution", silver: false, gold: false, enterprise: true },
  { feature: "Optimization reviews", silver: "Monthly", gold: "Weekly", enterprise: "Weekly" },
  { feature: "Dedicated strategy support", silver: false, gold: false, enterprise: true },
  { feature: "Enterprise onboarding & consulting", silver: false, gold: false, enterprise: true },
  { feature: "Account manager", silver: false, gold: true, enterprise: true },
  { feature: "Slack channel", silver: false, gold: true, enterprise: true },
  { feature: "Response SLA", silver: "24h", gold: "4h", enterprise: "Guaranteed" },
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
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${tier.highlight ? "text-[#9ca3af]" : "text-[#6b7280]"}`}>
                    {tier.badge}
                  </p>
                  <p className={`text-[18px] font-bold mb-3 ${tier.highlight ? "text-white" : "text-[#111111]"}`}>
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
                    href={tier.ctaHref}
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
              {tiers.map((tier) => (
                <div key={tier.name} className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                  <div className="px-8 py-6 border-b border-[#e5e7eb] bg-[#fafafa] flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">
                        {tier.badge}
                      </p>
                      <h3 className="text-[20px] font-bold text-[#111111] tracking-tight">
                        {tier.name}
                        <span className="text-[16px] font-normal text-[#6b7280] ml-2">
                          {tier.price}{tier.period}
                        </span>
                      </h3>
                    </div>
                    <Link
                      href={tier.ctaHref}
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
                {["Silver", "Gold", "Enterprise"].map((tier, i) => (
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
                  {[row.silver, row.gold, row.enterprise].map((val, j) => (
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
