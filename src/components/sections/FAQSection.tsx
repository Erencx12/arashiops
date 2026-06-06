"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long until we see results?",
    a: "Most clients see measurable improvements in lead volume and pipeline within 30–45 days of system deployment. Significant revenue impact typically follows in months 2–3 as the full system reaches operating rhythm.",
  },
  {
    q: "Do we need to change our CRM?",
    a: "No. We build on top of your existing CRM (HubSpot, Salesforce, Pipedrive, or others). If you don't have one yet, we'll recommend and implement the right tool for your stage and budget.",
  },
  {
    q: "What makes Meridian different from a marketing agency?",
    a: "Traditional agencies sell individual services in isolation: ads, SEO, campaigns. We build outbound acquisition infrastructure. A systematic pipeline that takes a target account from identification to qualified meeting, with full revenue attribution. We measure ourselves against pipeline and closed revenue, not vanity metrics.",
  },
  {
    q: "How involved do we need to be?",
    a: "We're designed to run with minimal interruption to your team. You'll attend a kickoff, weekly or monthly syncs depending on tier, and review deliverables. We handle execution. Your involvement is strategic, not operational.",
  },
  {
    q: "Is there a setup fee?",
    a: "Yes. A one-time onboarding and systems setup fee applies at the start of engagement. This covers the discovery process, system architecture, CRM build, and initial campaign setup. It's clearly stated in every proposal.",
  },
  {
    q: "What industries do you work with?",
    a: "We work primarily with B2B service businesses, SaaS companies, professional service firms, and high-ticket B2C brands. If your average deal size exceeds $3,000 and your sales process involves more than one touchpoint, we're likely a fit.",
  },
  {
    q: "Do you offer short-term engagements?",
    a: "Our minimum engagement is 3 months. Revenue systems take time to calibrate and compound. We don't offer one-off projects because they don't produce the outcomes our methodology is designed to generate.",
  },
  {
    q: "Can we cancel at any time?",
    a: "After the initial 3-month term, engagements are month-to-month with 30 days notice. We prefer to earn your continued business by delivering results, not by locking you into long contracts.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 px-6 bg-[#fafafa] border-t border-[#e5e7eb]">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid lg:grid-cols-[340px_1fr] gap-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-3">
              FAQ
            </p>
            <h2 className="text-[32px] font-bold tracking-[-0.025em] text-[#111111] leading-tight mb-4">
              Questions we
              <br />
              hear often.
            </h2>
            <p className="text-[15px] text-[#6b7280] leading-relaxed">
              If you have something else in mind,{" "}
              <a
                href="/contact"
                className="text-[#111111] underline underline-offset-2 hover:no-underline"
              >
                get in touch directly
              </a>
              .
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Accordion multiple={false} className="space-y-0">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={i}
                  className="border-b border-[#e5e7eb] last:border-b-0"
                >
                  <AccordionTrigger className="py-4 text-[14px] font-medium text-[#111111] hover:no-underline text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-[13.5px] text-[#6b7280] leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
