"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const id = "solutions";

const steps = [
  {
    stage: "01",
    title: "Prospect Identification",
    description:
      "ICP definition, target account research, and buyer persona mapping. We define exactly who to reach and build the targeting criteria your outreach will run against.",
    tags: ["ICP Mapping", "Apollo", "Clay"],
  },
  {
    stage: "02",
    title: "List Building & Verification",
    description:
      "Verified prospect lists built to spec. Contact data enriched, validated, and deduplicated before a single email is sent.",
    tags: ["Data Enrichment", "Email Verification", "Clay"],
  },
  {
    stage: "03",
    title: "Campaign Deployment",
    description:
      "Multi-domain cold email infrastructure with 7-touch sequences per persona. Inboxes warmed. Sending limits managed. Deliverability monitored.",
    tags: ["Instantly", "Smartlead", "Cold Email"],
  },
  {
    stage: "04",
    title: "Lead Response Management",
    description:
      "Every reply is categorized, sorted, and routed. Positive replies escalated immediately. Negative replies removed. Out-of-office handled automatically.",
    tags: ["Reply Handling", "Categorization", "Routing"],
  },
  {
    stage: "05",
    title: "Lead Qualification",
    description:
      "Claude-powered qualification layer scores every interested lead against your ICP and deal criteria before any human contact.",
    tags: ["Claude AI", "Lead Scoring", "Qualification"],
  },
  {
    stage: "06",
    title: "CRM Routing",
    description:
      "Qualified leads flow directly into your CRM with full context attached. Deal stage set, owner assigned, follow-up task created automatically.",
    tags: ["HubSpot", "Salesforce", "Auto-routing"],
  },
  {
    stage: "07",
    title: "Revenue Tracking",
    description:
      "Full attribution from first touch to closed deal. Which campaigns, sequences, and personas are generating revenue — and which aren't.",
    tags: ["Attribution", "Pipeline", "Reporting"],
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
            Outbound Revenue Infrastructure
          </h2>
          <p className="text-[16px] text-[#6b7280] max-w-[480px] leading-relaxed">
            A systematic acquisition pipeline that takes a prospect from
            identification to qualified meeting — built, deployed, and operated
            by Meridian.
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
