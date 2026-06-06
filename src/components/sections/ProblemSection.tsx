"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const problems = [
  {
    title: "Inconsistent lead flow",
    description:
      "Revenue depends on outbound effort that stops when the team gets busy. No predictable pipeline.",
  },
  {
    title: "No follow-up system",
    description:
      "Leads fall through the cracks because there's no structured nurture or re-engagement process.",
  },
  {
    title: "Zero visibility",
    description:
      "No single view of campaign performance, conversion rates, or revenue attribution across channels.",
  },
  {
    title: "Manual operations",
    description:
      "Hours wasted on tasks that should be automated: CRM updates, scheduling, reporting, handoffs.",
  },
  {
    title: "Slow content output",
    description:
      "Content creation is ad hoc, inconsistent, and disconnected from lead generation outcomes.",
  },
  {
    title: "Misaligned sales process",
    description:
      "Marketing hands off unqualified leads. Sales closes at low rates. Nobody agrees on what a qualified lead looks like.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
            The problem
          </p>
          <h2 className="text-[36px] font-bold tracking-[-0.025em] text-[#111111] mb-4 max-w-[540px] leading-tight">
            Most businesses operate without a revenue system.
          </h2>
          <p className="text-[16px] text-[#6b7280] max-w-[480px] leading-relaxed">
            They rely on effort, not infrastructure. The result is unpredictable
            revenue, wasted capacity, and growth that plateaus.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e7eb] border border-[#e5e7eb] rounded-xl overflow-hidden">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white p-6 hover:bg-[#fafafa] transition-colors"
            >
              <AlertCircle
                size={16}
                className="text-[#d1d5db] mb-3"
                strokeWidth={1.5}
              />
              <h3 className="text-[14px] font-semibold text-[#111111] mb-2">
                {p.title}
              </h3>
              <p className="text-[13.5px] text-[#6b7280] leading-relaxed">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
