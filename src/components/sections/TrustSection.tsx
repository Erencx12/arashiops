"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "45 min", label: "Discovery call" },
  { value: "3 - 6 weeks", label: "Deployment timeline" },
  { value: "3 mo", label: "Minimum engagement" },
  { value: "30 day", label: "Exit notice period" },
];

const industries = [
  "B2B SaaS",
  "Professional Services",
  "E-Commerce",
  "Management Consulting",
  "Enterprise Tech",
  "Consumer Brands",
];

export function TrustSection() {
  return (
    <section className="border-y border-[#e5e7eb] bg-[#fafafa]">
      {/* Stats row */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#e5e7eb] divide-y lg:divide-y-0 border-b border-[#e5e7eb]">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="px-8 py-8"
            >
              <p className="text-[30px] font-bold tracking-[-0.03em] text-[#111111] mb-1">
                {stat.value}
              </p>
              <p className="text-[13px] text-[#6b7280]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Industry strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-6"
        >
          <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest text-center mb-5">
            Industries we work with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {industries.map((name) => (
              <span
                key={name}
                className="text-[14px] font-semibold text-[#d1d5db] tracking-tight hover:text-[#9ca3af] transition-colors cursor-default"
                aria-label={name}
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
