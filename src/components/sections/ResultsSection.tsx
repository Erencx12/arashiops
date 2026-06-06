"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const cases = [
  {
    industry: "B2B SaaS",
    company: "Series A Revenue Intelligence Platform",
    period: "90 days",
    challenge:
      "The founding team relied entirely on referrals. Pipeline was invisible and dependent entirely on the CEO's personal network.",
    approach:
      "Deployed a full ICP mapping exercise, built a three-channel outbound system (email + LinkedIn + referral), and implemented automated lead scoring inside HubSpot.",
    metrics: [
      { label: "Qualified Meetings / mo", before: "12", after: "94" },
      { label: "Pipeline Value", before: "$180K", after: "$1.4M" },
      { label: "Close Rate", before: "8%", after: "23%" },
      { label: "Leads Processed / mo", before: "38", after: "312" },
    ],
  },
  {
    industry: "Professional Services",
    company: "Management Consulting Firm",
    period: "6 months",
    challenge:
      "Two senior consultants were spending 15 hours a week on manual prospecting. Deal velocity was slow and the team was burning out on admin that should never have touched their calendar.",
    approach:
      "Rebuilt the entire sales infrastructure. Replaced manual outreach with automated multi-touch sequences and built a qualification layer that vetted leads before any human contact.",
    metrics: [
      { label: "Weekly Outreach Volume", before: "60", after: "420" },
      { label: "Average Deal Size", before: "$12K", after: "$28K" },
      { label: "Response Rate", before: "4%", after: "18%" },
      { label: "Monthly Revenue", before: "$85K", after: "$310K" },
    ],
  },
  {
    industry: "DTC E-Commerce",
    company: "DTC Consumer Brand",
    period: "4 months",
    challenge:
      "CAC from paid channels had hit an unsustainable ceiling. The brand needed to build an owned audience without depending entirely on ad spend.",
    approach:
      "Built a content operating system producing 18 pieces of content per month. Combined LinkedIn authority content with a high-frequency email programme and referral incentive structure.",
    metrics: [
      { label: "Organic Leads / mo", before: "22", after: "148" },
      { label: "Email Subscribers", before: "1,200", after: "9,800" },
      { label: "Customer CAC", before: "$320", after: "$84" },
      { label: "Content Output / mo", before: "2", after: "18" },
    ],
  },
];

export function ResultsSection() {
  return (
    <section id="results" className="py-24 px-6">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
            Case Studies
          </p>
          <h2 className="text-[36px] font-bold tracking-[-0.025em] text-[#111111] mb-4 leading-tight">
            Results that reshape
            <br />
            business trajectories.
          </h2>
          <p className="text-[16px] text-[#6b7280] max-w-[440px] leading-relaxed">
            Every engagement is benchmarked from day one. These are documented
            outcomes with real before-and-after baselines.
          </p>
        </motion.div>

        <div className="space-y-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="border border-[#e5e7eb] rounded-xl overflow-hidden hover:border-[#d1d5db] transition-colors"
            >
              {/* Header */}
              <div className="px-7 py-5 border-b border-[#e5e7eb] flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1">
                    {c.industry}
                  </p>
                  <p className="text-[15px] font-semibold text-[#111111]">{c.company}</p>
                </div>
                <span className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] px-2.5 py-1 rounded-full">
                  {c.period}
                </span>
              </div>

              {/* Body */}
              <div className="grid lg:grid-cols-[1fr_1fr_1.4fr] gap-0">
                {/* Challenge */}
                <div className="px-7 py-6 lg:border-r border-[#e5e7eb] border-b lg:border-b-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d1d5db]" />
                    <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">
                      Challenge
                    </p>
                  </div>
                  <p className="text-[13.5px] text-[#374151] leading-relaxed">{c.challenge}</p>
                </div>

                {/* Approach */}
                <div className="px-7 py-6 lg:border-r border-[#e5e7eb] border-b lg:border-b-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
                    <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">
                      Approach
                    </p>
                  </div>
                  <p className="text-[13.5px] text-[#374151] leading-relaxed">{c.approach}</p>
                </div>

                {/* Metrics */}
                <div className="px-7 py-6 bg-[#fafafa]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">
                      Outcomes
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {c.metrics.map((m) => (
                      <div key={m.label}>
                        <p className="text-[10px] text-[#9ca3af] font-medium uppercase tracking-wide mb-1">
                          {m.label}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] text-[#9ca3af] line-through">
                            {m.before}
                          </span>
                          <ArrowRight size={9} className="text-emerald-500 shrink-0" />
                          <span className="text-[16px] font-bold text-[#111111] tracking-tight">
                            {m.after}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
