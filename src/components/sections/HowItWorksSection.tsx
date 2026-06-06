"use client";

import { motion } from "framer-motion";

const id = "process";

const steps = [
  {
    number: "01",
    title: "Discovery Call",
    description:
      "We spend 45 minutes understanding your business model, current revenue operations, and the specific constraints holding growth back. No pitch. Just diagnosis.",
    duration: "45 min",
  },
  {
    number: "02",
    title: "Strategy & Planning",
    description:
      "We build a custom revenue system blueprint. We map your ideal customer journey, identify the gaps, and sequence the build by ROI priority.",
    duration: "5–7 days",
  },
  {
    number: "03",
    title: "System Deployment",
    description:
      "Our team builds, installs, and tests every component of your revenue system. You receive documentation, dashboards, and a full handoff briefing.",
    duration: "3–6 weeks",
  },
  {
    number: "04",
    title: "Ongoing Growth",
    description:
      "Monthly optimization cycles, campaign management, and performance reviews. We operate the system with you, improving conversion at every layer.",
    duration: "Ongoing",
  },
];

export function HowItWorksSection() {
  return (
    <section id={id} className="py-24 px-6">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
            How it works
          </p>
          <h2 className="text-[36px] font-bold tracking-[-0.025em] text-[#111111] mb-4 leading-tight">
            From zero to operating system
            <br />
            in weeks, not quarters.
          </h2>
          <p className="text-[16px] text-[#6b7280] max-w-[420px] leading-relaxed">
            A structured engagement process with clear deliverables and
            measurable outcomes at every stage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e7eb] border border-[#e5e7eb] rounded-xl overflow-hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white p-7 group hover:bg-[#fafafa] transition-colors"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="text-[11px] font-semibold text-[#9ca3af] tracking-widest">
                  {step.number}
                </span>
                <span className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded-full">
                  {step.duration}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-[#111111] mb-3 leading-tight">
                {step.title}
              </h3>
              <p className="text-[13.5px] text-[#6b7280] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
