import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, TrendingUp, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";

export async function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return { title: "Case Study Not Found" };
  return {
    title: `Case Study — ${cs.company}`,
    description: cs.tagline,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-[1280px] mx-auto">

          {/* Back link */}
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-[#111111] transition-colors mb-10"
          >
            <ArrowLeft size={13} />
            All case studies
          </Link>

          {/* Hero */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden mb-8">
            <div className="px-10 py-10 border-b border-[#e5e7eb]">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">
                  {cs.industry}
                </span>
                <span className="text-[#d1d5db]">·</span>
                <span className="text-[11px] font-medium text-[#6b7280]">{cs.category}</span>
                <span className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded-full ml-auto">
                  {cs.period}
                </span>
              </div>
              <h1 className="text-[38px] font-bold tracking-[-0.03em] text-[#111111] leading-tight mb-5 max-w-[760px]">
                {cs.tagline}
              </h1>
              <p className="text-[16px] text-[#6b7280] leading-relaxed max-w-[680px]">
                {cs.summary}
              </p>
            </div>

            {/* Hero metrics strip */}
            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(cs.metrics.length, 6)} divide-x divide-y md:divide-y-0 divide-[#e5e7eb] bg-[#fafafa]`}>
              {cs.metrics.slice(0, 6).map((m, i) => (
                <div key={m.label} className="px-6 py-5">
                  <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-2">
                    {m.label}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[12px] text-[#9ca3af] line-through">{m.before}</span>
                    <TrendingUp size={11} className="text-emerald-500 shrink-0" />
                    <span className="text-[22px] font-bold text-[#111111] tracking-tight">
                      {m.after}
                    </span>
                  </div>
                  {m.note && (
                    <p className="text-[10.5px] text-[#9ca3af] mt-0.5">{m.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Case study body */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Main content */}
            <div className="space-y-8">

              {/* Challenge */}
              <Section label="Challenge" accent="#d1d5db">
                <p className="text-[15.5px] text-[#374151] leading-[1.8] mb-5">
                  {cs.challenge.overview}
                </p>
                <ul className="space-y-3">
                  {cs.challenge.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db] mt-[9px] shrink-0" />
                      <span className="text-[14.5px] text-[#374151] leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Strategy */}
              <Section label="Strategy" accent="#4f46e5">
                <p className="text-[15.5px] text-[#374151] leading-[1.8] mb-6">
                  {cs.strategy.overview}
                </p>
                <div className="space-y-4">
                  {cs.strategy.phases.map((phase, i) => (
                    <div key={phase.name} className="flex gap-5">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-7 h-7 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-[#6b7280]">{i + 1}</span>
                        </div>
                        {i < cs.strategy.phases.length - 1 && (
                          <div className="w-px flex-1 bg-[#e5e7eb] mt-2" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-[14px] font-semibold text-[#111111] mb-1.5">{phase.name}</p>
                        <p className="text-[13.5px] text-[#6b7280] leading-relaxed">{phase.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Execution */}
              <Section label="Execution" accent="#111111">
                <p className="text-[15.5px] text-[#374151] leading-[1.8] mb-6">
                  {cs.execution.overview}
                </p>
                <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
                  {cs.execution.steps.map((step, i) => (
                    <div
                      key={step.week}
                      className={`grid grid-cols-[120px_1fr] divide-x divide-[#e5e7eb] ${
                        i < cs.execution.steps.length - 1 ? "border-b border-[#e5e7eb]" : ""
                      }`}
                    >
                      <div className="px-4 py-3.5 bg-[#fafafa] flex items-center">
                        <span className="text-[11.5px] font-medium text-[#6b7280]">{step.week}</span>
                      </div>
                      <div className="px-4 py-3.5 flex items-center">
                        <span className="text-[13.5px] text-[#374151]">{step.milestone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Results */}
              <Section label="Results" accent="#10b981">
                <p className="text-[15.5px] text-[#374151] leading-[1.8]">
                  {cs.results.overview}
                </p>
              </Section>

              {/* Lessons */}
              <Section label="Lessons" accent="#f59e0b">
                <div className="space-y-5">
                  {cs.lessons.map((lesson) => (
                    <div key={lesson.title} className="border border-[#e5e7eb] rounded-lg p-5">
                      <div className="flex items-start gap-3 mb-2">
                        <Check size={14} className="text-[#6b7280] mt-0.5 shrink-0" />
                        <p className="text-[14.5px] font-semibold text-[#111111]">{lesson.title}</p>
                      </div>
                      <p className="text-[13.5px] text-[#6b7280] leading-relaxed pl-[23px]">
                        {lesson.body}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Sidebar */}
            <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              {/* Full metrics */}
              <div className="border border-[#e5e7eb] rounded-xl p-6">
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-5">
                  All outcomes
                </p>
                <div className="space-y-4">
                  {cs.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-[10.5px] text-[#9ca3af] uppercase tracking-wide mb-1.5">
                        {m.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[12px] text-[#9ca3af] line-through">{m.before}</span>
                        <TrendingUp size={10} className="text-emerald-500 shrink-0" />
                        <span className="text-[18px] font-bold text-[#111111]">{m.after}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[#e5e7eb] space-y-2.5">
                  <Link
                    href="/get-started"
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#111111] text-white text-[13.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
                  >
                    Get Started
                    <ArrowRight size={13} />
                  </Link>
                  <Link
                    href="/book"
                    className="flex items-center justify-center gap-2 py-2.5 border border-[#e5e7eb] text-[#374151] text-[13.5px] font-medium rounded-md hover:bg-[#f9fafb] transition-colors"
                  >
                    Book a Call
                  </Link>
                </div>
              </div>

              {/* Other case studies */}
              <div className="border border-[#e5e7eb] rounded-xl p-6">
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">
                  Other case studies
                </p>
                <div className="space-y-3">
                  {caseStudies
                    .filter((c) => c.slug !== cs.slug)
                    .map((c) => (
                      <Link
                        key={c.slug}
                        href={`/results/${c.slug}`}
                        className="group block"
                      >
                        <p className="text-[11px] text-[#9ca3af] mb-0.5">{c.industry}</p>
                        <p className="text-[13px] font-medium text-[#374151] group-hover:text-[#111111] transition-colors">
                          {c.company}
                        </p>
                        <p className="text-[12px] text-[#9ca3af]">
                          {c.heroMetric.value} {c.heroMetric.label}
                        </p>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
      <div className="px-7 py-4 border-b border-[#e5e7eb] bg-[#fafafa] flex items-center gap-3">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: accent }}
        />
        <h2 className="text-[13px] font-semibold text-[#111111] uppercase tracking-widest">
          {label}
        </h2>
      </div>
      <div className="px-7 py-7">{children}</div>
    </div>
  );
}
