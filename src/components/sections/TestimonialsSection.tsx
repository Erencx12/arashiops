"use client";

import { motion } from "framer-motion";
import { Wrench, BarChart2, ArrowUpRight } from "lucide-react";

const differentiators = [
  {
    number: "01",
    icon: Wrench,
    title: "System-first, campaign-second.",
    body: "We design the operating infrastructure before a single campaign runs. Architecture first, execution second. The result is growth that compounds instead of resetting every quarter.",
  },
  {
    number: "02",
    icon: BarChart2,
    title: "Measured against revenue.",
    body: "Every engagement is benchmarked against pipeline value and closed revenue. Not open rates, impressions, or click-through counts. If it doesn't show up in your numbers, it doesn't count.",
  },
  {
    number: "03",
    icon: ArrowUpRight,
    title: "Built to run without us.",
    body: "The goal of every engagement is to hand off an asset you own. Full documentation, team training, and clean systems. When we leave, the infrastructure keeps working.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 border-t border-[#e5e7eb]">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
            How we think
          </p>
          <h2 className="text-[36px] font-bold tracking-[-0.025em] text-[#111111] leading-tight mb-5">
            Built on a different
            <br />
            premise.
          </h2>
          <p className="text-[16px] text-[#6b7280] max-w-[480px] leading-relaxed">
            Traditional agencies sell deliverables. We build infrastructure.
            The difference shows up in every engagement outcome.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          {differentiators.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex flex-col border border-[#e5e7eb] rounded-xl p-7 hover:border-[#d1d5db] transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-[11px] font-semibold text-[#9ca3af] tracking-widest">
                  {d.number}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <d.icon size={15} className="text-[#374151]" strokeWidth={1.75} />
                </div>
              </div>
              <h3 className="text-[15px] font-semibold text-[#111111] mb-3 leading-tight">
                {d.title}
              </h3>
              <p className="text-[13.5px] text-[#6b7280] leading-[1.75] flex-1">
                {d.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
