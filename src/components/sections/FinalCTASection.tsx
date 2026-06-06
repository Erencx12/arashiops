"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function FinalCTASection() {
  return (
    <section id="contact" className="py-32 px-6 border-t border-[#e5e7eb]">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-[680px]"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] mb-5">
            Ready to build?
          </p>
          <h2 className="text-[48px] font-bold tracking-[-0.03em] text-[#111111] leading-[1.05] mb-6 text-balance">
            Your revenue system
            <br />
            starts with a call.
          </h2>
          <p className="text-[17px] text-[#6b7280] leading-relaxed mb-10 max-w-[500px]">
            Tell us about your business and where you want to be in 12 months.
            We'll map the infrastructure required to get there.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#222222] transition-colors"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium text-[#111111] border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] transition-colors"
            >
              Book a Call
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
