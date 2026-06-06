"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cal, { getCalApi } from "@calcom/embed-react";
import { Check, ArrowRight, X, Users, MessageSquare, Target } from "lucide-react";

const CAL_LINK = "soham-das-osleft/discovery-call";

const whyPoints = [
  {
    icon: Target,
    title: "Diagnostic, not a pitch",
    body: "We use this call to understand your business, not to sell you anything. If we're not a fit, we'll tell you.",
  },
  {
    icon: MessageSquare,
    title: "Specific recommendations",
    body: "You'll leave with a clear picture of what's holding your revenue back and what it would actually take to fix it.",
  },
  {
    icon: Users,
    title: "Founder-to-operator conversation",
    body: "You speak directly with Arashi OPS's senior strategists. No account executives, no pre-sales reps.",
  },
];

const agendaItems = [
  "Your current revenue model and what's working",
  "The specific bottlenecks holding back growth",
  "Your goals for the next 6–12 months",
  "An honest assessment of where Arashi OPS adds value",
  "What a system deployment would look like for your business",
];

const forItems = [
  "B2B businesses generating $100K+ ARR",
  "Founders serious about building a repeatable revenue system",
  "Companies that have product-market fit and are ready to scale",
  "Businesses currently relying on founder-led sales or referrals",
  "Teams that want outcomes, not just deliverables",
];

const notForItems = [
  "Businesses looking for quick-win campaigns or one-off projects",
  "Pre-revenue or idea-stage companies",
  "Companies wanting to outsource sales entirely without infrastructure",
  "Businesses not prepared to invest in systematic growth",
];

function CalSkeleton() {
  return (
    <div className="absolute inset-0 bg-white z-10 flex animate-pulse">
      {/* Left panel */}
      <div className="w-[280px] shrink-0 border-r border-[#f3f4f6] p-8 space-y-4">
        <div className="h-3 w-24 bg-[#f3f4f6] rounded" />
        <div className="h-6 w-40 bg-[#f3f4f6] rounded" />
        <div className="h-3 w-20 bg-[#f3f4f6] rounded" />
        <div className="h-3 w-28 bg-[#f3f4f6] rounded" />
        <div className="mt-6 space-y-2">
          <div className="h-3 w-full bg-[#f3f4f6] rounded" />
          <div className="h-3 w-4/5 bg-[#f3f4f6] rounded" />
          <div className="h-3 w-3/5 bg-[#f3f4f6] rounded" />
        </div>
      </div>
      {/* Right panel — calendar grid */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-32 bg-[#f3f4f6] rounded" />
          <div className="flex gap-2">
            <div className="h-7 w-7 bg-[#f3f4f6] rounded-full" />
            <div className="h-7 w-7 bg-[#f3f4f6] rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="h-3 bg-[#f3f4f6] rounded mx-auto w-6" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-9 w-9 bg-[#f3f4f6] rounded-full mx-auto" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CalEmbed() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "discovery-call" });
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#111111" },
          dark: { "cal-brand": "#111111" },
        },
      });
      cal("on", {
        action: "linkReady",
        callback: () => setLoaded(true),
      });
    })();
  }, []);

  return (
    <div className="relative min-h-[600px]">
      <Cal
        namespace="discovery-call"
        calLink={CAL_LINK}
        style={{ width: "100%", height: "100%" }}
        config={{ layout: "month_view" }}
      />
      {!loaded && <CalSkeleton />}
    </div>
  );
}

export function BookACallContent() {
  return (
    <main className="pt-28 pb-24 px-6">
      <div className="max-w-[1280px] mx-auto">

        {/* Page header */}
        <div className="max-w-[620px] mb-16">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
            Book a Call
          </p>
          <h1 className="text-[48px] font-bold tracking-[-0.03em] text-[#111111] leading-[1.08] mb-5">
            45 minutes.
            <br />
            No pitch. Just clarity.
          </h1>
          <p className="text-[17px] text-[#6b7280] leading-relaxed">
            A focused diagnostic conversation about your business, your revenue
            bottlenecks, and what a system looks like for your specific stage.
          </p>
        </div>

        {/* Why cards */}
        <div className="grid md:grid-cols-3 gap-px bg-[#e5e7eb] border border-[#e5e7eb] rounded-xl overflow-hidden mb-12">
          {whyPoints.map((pt) => (
            <div key={pt.title} className="bg-white px-7 py-7 hover:bg-[#fafafa] transition-colors">
              <pt.icon size={20} className="text-[#374151] mb-4" strokeWidth={1.75} />
              <h3 className="text-[14.5px] font-semibold text-[#111111] mb-2">{pt.title}</h3>
              <p className="text-[13.5px] text-[#6b7280] leading-relaxed">{pt.body}</p>
            </div>
          ))}
        </div>

        {/* Cal embed + sidebar */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* Cal.com inline embed */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden min-h-[600px]">
            <CalEmbed />
          </div>

          {/* Right sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">

            {/* Agenda */}
            <div className="border border-[#e5e7eb] rounded-xl p-6">
              <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">
                What we&apos;ll cover
              </p>
              <ul className="space-y-3">
                {agendaItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={12} className="text-[#6b7280] mt-[3px] shrink-0" strokeWidth={2.5} />
                    <span className="text-[13.5px] text-[#374151] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who it's for / not for */}
            <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e5e7eb]">
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">
                  Who this is for
                </p>
                <ul className="space-y-2.5">
                  {forItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={12} className="text-emerald-500 mt-[3px] shrink-0" strokeWidth={2.5} />
                      <span className="text-[13px] text-[#374151] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-5 bg-[#fafafa]">
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">
                  Who this is not for
                </p>
                <ul className="space-y-2.5">
                  {notForItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <X size={12} className="text-[#d1d5db] mt-[3px] shrink-0" strokeWidth={2.5} />
                      <span className="text-[13px] text-[#6b7280] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prefer form */}
            <div className="border border-[#e5e7eb] rounded-xl p-6">
              <p className="text-[13px] font-medium text-[#374151] mb-1">
                Prefer structured onboarding?
              </p>
              <p className="text-[12.5px] text-[#9ca3af] mb-4">
                Complete our 5-step intake form and we&apos;ll come prepared.
              </p>
              <Link
                href="/get-started"
                className="flex items-center justify-center gap-2 py-2.5 border border-[#e5e7eb] text-[#374151] text-[13.5px] font-medium rounded-md hover:bg-[#f9fafb] transition-colors"
              >
                Use Get Started Instead
                <ArrowRight size={12} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
