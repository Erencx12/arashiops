"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const id = "solutions";

const steps = [
  {
    stage: "01",
    title: "Research & Intelligence",
    description:
      "Deep market research, ICP definition, and competitive analysis. We identify exactly who to target and why they should care.",
    tags: ["ICP Mapping", "Market Research", "Positioning"],
  },
  {
    stage: "02",
    title: "Content Production",
    description:
      "High-signal content that builds authority and drives inbound interest. Written, distributed, and tracked against outcomes.",
    tags: ["Copywriting", "LinkedIn", "Email Sequences"],
  },
  {
    stage: "03",
    title: "Lead Capture & Qualification",
    description:
      "Multi-channel outbound with automated qualification flows. Only decision-ready leads pass through to your team.",
    tags: ["Outbound", "Lead Scoring", "Automation"],
  },
  {
    stage: "04",
    title: "CRM & Pipeline Management",
    description:
      "Structured CRM setup, deal stage tracking, and activity logging so nothing falls through the cracks.",
    tags: ["CRM Build", "Pipeline", "Reporting"],
  },
  {
    stage: "05",
    title: "Sales Enablement",
    description:
      "Scripts, objection handling, proposal templates, and discovery frameworks that improve close rates.",
    tags: ["Discovery Calls", "Proposals", "Closing"],
  },
  {
    stage: "06",
    title: "Revenue Tracking",
    description:
      "Real-time dashboards connecting activity to revenue. Full attribution across every channel and touchpoint.",
    tags: ["Attribution", "Dashboards", "Forecasting"],
  },
];

export function SolutionSection() {
  return (
    <section id={id} className="py-24 px-6 bg-[#fafafa] border-y border-[#e5e7eb]">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
            The solution
          </p>
          <h2 className="text-[36px] font-bold tracking-[-0.025em] text-[#111111] mb-4 max-w-[540px] leading-tight">
            The Meridian Revenue Operating System
          </h2>
          <p className="text-[16px] text-[#6b7280] max-w-[480px] leading-relaxed">
            A fully integrated set of systems that work together, from first
            impression to closed deal and beyond.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-[27px] top-8 bottom-8 w-px bg-[#e5e7eb] hidden lg:block" />

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.stage}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative flex gap-6 items-start bg-white border border-[#e5e7eb] rounded-xl p-6 hover:border-[#d1d5db] transition-colors"
              >
                {/* Stage number */}
                <div className="shrink-0 w-[40px] h-[40px] rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center relative z-10">
                  <span className="text-[11px] font-semibold text-[#6b7280]">
                    {step.stage}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#111111] mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[13.5px] text-[#6b7280] leading-relaxed mb-3">
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow connector (except last) */}
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-[14px] left-[42px] z-20 hidden lg:block">
                    <ArrowDown size={12} className="text-[#d1d5db]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
