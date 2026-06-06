"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const id = "pricing";

const tiers = [
  {
    name: "Outbound Foundation",
    badge: "Silver",
    price: "$1,500",
    period: "/mo",
    description:
      "For B2B companies building their first structured outbound acquisition system.",
    features: [
      "ICP definition & prospect research",
      "Verified lead lists",
      "2 cold email domains",
      "2 active outreach campaigns",
      "7-touch email sequences",
      "CRM routing setup",
      "Monthly optimization review",
      "Monthly reporting",
    ],
    cta: "Get Started",
    ctaHref: "/get-started",
    highlight: false,
  },
  {
    name: "Revenue Infrastructure",
    badge: "Gold",
    price: "$4,500",
    period: "/mo",
    description:
      "For revenue-focused teams ready to scale pipeline with full outbound infrastructure.",
    features: [
      "Everything in Outbound Foundation",
      "5 active campaigns",
      "Multi-domain infrastructure",
      "Claude lead qualification",
      "Reply categorization",
      "Automated CRM routing",
      "Sales enablement frameworks",
      "Revenue attribution dashboard",
      "Weekly optimization reviews",
    ],
    cta: "Get Started",
    ctaHref: "/get-started",
    highlight: true,
  },
  {
    name: "Enterprise",
    badge: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "Custom revenue infrastructure for companies requiring deeper automation, CRM integrations, and multi-channel acquisition systems.",
    features: [
      "Everything in Gold",
      "Multi-workflow automation",
      "Advanced CRM integrations",
      "Custom reporting & attribution",
      "Dedicated strategy support",
      "Enterprise onboarding & consulting",
    ],
    cta: "Schedule Strategy Call",
    ctaHref: "/book",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id={id} className="py-24 px-6 bg-[#fafafa] border-t border-[#e5e7eb]">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
            Pricing
          </p>
          <h2 className="text-[36px] font-bold tracking-[-0.025em] text-[#111111] mb-4 leading-tight">
            Infrastructure-level engagement.
            <br />
            Not retainer-level vagueness.
          </h2>
          <p className="text-[16px] text-[#6b7280] max-w-[420px] leading-relaxed">
            Every tier is built around outcomes. Clear deliverables, defined
            scope, and measurable performance.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative rounded-xl border p-8 flex flex-col ${
                tier.highlight
                  ? "bg-[#111111] border-[#111111] shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
                  : "bg-white border-[#e5e7eb]"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[11px] font-semibold bg-[#4f46e5] text-white px-3 py-1 rounded-full">
                      Recommended
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p
                  className={`text-[12px] font-semibold uppercase tracking-widest mb-1.5 ${
                    tier.highlight ? "text-[#9ca3af]" : "text-[#6b7280]"
                  }`}
                >
                  {tier.badge}
                </p>
                <p
                  className={`text-[17px] font-bold mb-3 ${
                    tier.highlight ? "text-white" : "text-[#111111]"
                  }`}
                >
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span
                    className={`text-[38px] font-bold tracking-tight ${
                      tier.highlight ? "text-white" : "text-[#111111]"
                    }`}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      className={`text-[14px] ${
                        tier.highlight ? "text-[#9ca3af]" : "text-[#6b7280]"
                      }`}
                    >
                      {tier.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[13.5px] leading-relaxed ${
                    tier.highlight ? "text-[#9ca3af]" : "text-[#6b7280]"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className={`shrink-0 mt-0.5 ${
                        tier.highlight ? "text-[#4f46e5]" : "text-[#111111]"
                      }`}
                    />
                    <span
                      className={`text-[13.5px] ${
                        tier.highlight ? "text-[#d1d5db]" : "text-[#374151]"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={`block text-center py-2.5 rounded-md text-[14px] font-medium transition-colors ${
                  tier.highlight
                    ? "bg-white text-[#111111] hover:bg-[#f3f4f6]"
                    : "bg-[#111111] text-white hover:bg-[#1a1a1a]"
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
