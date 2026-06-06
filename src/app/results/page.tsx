import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Client Results",
  description:
    "Documented case studies from Meridian client engagements — measurable before-and-after outcomes from real revenue system deployments.",
};

export default function ResultsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-[1280px] mx-auto">

          {/* Header */}
          <div className="max-w-[600px] mb-16">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
              Case Studies
            </p>
            <h1 className="text-[48px] font-bold tracking-[-0.03em] text-[#111111] leading-[1.08] mb-5">
              Results that reshape
              <br />
              trajectories.
            </h1>
            <p className="text-[17px] text-[#6b7280] leading-relaxed mb-5">
              Every engagement is benchmarked from day one. These are
              documented outcomes with real baselines and verified metrics.
            </p>
            <p className="text-[12.5px] text-[#9ca3af] border border-[#e5e7eb] rounded-lg px-4 py-3 bg-[#fafafa]">
              Illustrative case studies based on representative engagement outcomes. Client names have been anonymized. Results vary based on business stage and engagement scope.
            </p>
          </div>

          {/* Case study cards */}
          <div className="space-y-6">
            {caseStudies.map((cs, i) => (
              <Link
                key={cs.slug}
                href={`/results/${cs.slug}`}
                className="group block border border-[#e5e7eb] rounded-xl overflow-hidden hover:border-[#d1d5db] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200"
              >
                <div className="grid lg:grid-cols-[1fr_1fr_auto] gap-0">
                  {/* Info */}
                  <div className="px-8 py-8 lg:border-r border-b lg:border-b-0 border-[#e5e7eb]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">
                        {cs.industry}
                      </span>
                      <span className="text-[#e5e7eb]">·</span>
                      <span className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded-full">
                        {cs.period}
                      </span>
                    </div>
                    <h2 className="text-[20px] font-bold text-[#111111] tracking-tight mb-2">
                      {cs.company}
                    </h2>
                    <p className="text-[14px] text-[#6b7280] leading-relaxed max-w-[380px]">
                      {cs.tagline}
                    </p>
                  </div>

                  {/* Metrics preview */}
                  <div className="px-8 py-8 bg-[#fafafa] lg:border-r border-b lg:border-b-0 border-[#e5e7eb]">
                    <p className="text-[10.5px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">
                      Key outcomes
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {cs.metrics.slice(0, 4).map((m) => (
                        <div key={m.label}>
                          <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide mb-1.5">
                            {m.label}
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[11.5px] text-[#9ca3af] line-through">
                              {m.before}
                            </span>
                            <TrendingUp size={10} className="text-emerald-500 shrink-0" />
                            <span className="text-[16px] font-bold text-[#111111] tracking-tight">
                              {m.after}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA column */}
                  <div className="flex items-center justify-center px-8 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-[#e5e7eb] flex items-center justify-center group-hover:border-[#111111] group-hover:bg-[#111111] transition-all duration-200">
                        <ArrowRight size={14} className="text-[#9ca3af] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[11px] font-medium text-[#9ca3af] group-hover:text-[#111111] transition-colors">
                        Read case study
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 pt-16 border-t border-[#e5e7eb] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-[22px] font-bold tracking-tight text-[#111111] mb-2">
                Want results like these?
              </h3>
              <p className="text-[15px] text-[#6b7280]">
                Every engagement starts with a 45-minute discovery call.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e5e7eb] text-[#374151] text-[14px] font-medium rounded-md hover:bg-[#f9fafb] transition-colors"
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
