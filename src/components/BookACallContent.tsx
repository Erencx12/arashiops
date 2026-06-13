"use client";

import { useEffect, useState, useActionState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { Check, X, Users, MessageSquare, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { submitDiscoveryForm } from "@/lib/discovery-actions";

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

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors bg-white";
const labelCls = "block text-[12px] font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

function CalSkeleton() {
  return (
    <div className="absolute inset-0 bg-white z-10 flex animate-pulse">
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
    <div className="relative min-h-[900px]">
      <Cal
        namespace="discovery-call"
        calLink={CAL_LINK}
        style={{ width: "100%", height: "900px" }}
        config={{ layout: "month_view" }}
      />
      {!loaded && <CalSkeleton />}
    </div>
  );
}

export function BookACallContent() {
  const [step, setStep] = useState<"form" | "calendar">("form");
  const [state, action, pending] = useActionState(submitDiscoveryForm, null);

  useEffect(() => {
    if (state?.success) setStep("calendar");
  }, [state]);

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

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-[12.5px] font-semibold ${step === "form" ? "text-[#111111]" : "text-[#9ca3af] line-through"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === "form" ? "bg-[#111111] text-white" : "bg-[#e5e7eb] text-[#9ca3af]"}`}>
              {step === "calendar" ? "✓" : "1"}
            </span>
            Tell us about your business
          </div>
          <div className="flex-1 h-px bg-[#e5e7eb] max-w-[80px]" />
          <div className={`flex items-center gap-2 text-[12.5px] font-semibold ${step === "calendar" ? "text-[#111111]" : "text-[#9ca3af]"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === "calendar" ? "bg-[#111111] text-white" : "bg-[#f3f4f6] text-[#9ca3af]"}`}>
              2
            </span>
            Pick your time
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* Left: Form or Calendar */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            {step === "form" ? (
              <div className="p-8">
                <div className="mb-6">
                  <p className="text-[18px] font-bold text-[#111111] tracking-tight">Before we pick up the phone</p>
                  <p className="text-[13.5px] text-[#6b7280] mt-1">Tell us about your business. We use this to prepare — no generic questions on the call.</p>
                </div>
                <form action={action} className="space-y-5">
                  {state?.error && (
                    <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                      {state.error}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input name="full_name" required placeholder="Alex Johnson" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Company *</label>
                      <input name="company" required placeholder="Acme Inc." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Work Email *</label>
                      <input name="email" type="email" required placeholder="alex@acme.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Website</label>
                      <input name="website" type="url" placeholder="https://acme.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Industry *</label>
                      <input name="industry" required placeholder="B2B SaaS, E-commerce…" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Monthly Revenue</label>
                      <select name="revenue_range" className={`${inputCls} cursor-pointer`}>
                        <option value="">Select range</option>
                        <option>Under $10K</option>
                        <option>$10K — $50K</option>
                        <option>$50K — $200K</option>
                        <option>$200K — $1M</option>
                        <option>Over $1M</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>What's holding your revenue back? *</label>
                    <textarea
                      name="primary_challenges"
                      required
                      rows={3}
                      placeholder="Be specific — pipeline issues, conversion problems, team capacity, wrong ICP…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>What do you want from this call? *</label>
                    <textarea
                      name="call_goals"
                      required
                      rows={2}
                      placeholder="Clarity on a specific problem, understanding whether we're a fit, a roadmap…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#111111] text-white text-[13.5px] font-semibold rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
                  >
                    {pending ? "Saving…" : (
                      <>Continue — pick your time <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#f3f4f6] bg-emerald-50">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <p className="text-[13px] text-emerald-800 font-medium">
                    We've got your details. Now pick a time that works.
                  </p>
                </div>
                <div className="min-h-[900px]">
                  <CalEmbed />
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">

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

          </div>
        </div>
      </div>
    </main>
  );
}
