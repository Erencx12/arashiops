"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardMockup } from "@/components/DashboardMockup";

export function HeroSection() {
  return (
    <section className="pt-28 pb-20 px-6 overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Availability badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-white mb-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
              </span>
              <span className="text-[12px] text-[#374151] font-medium">
                Now accepting new clients
              </span>
            </div>

            <h1 className="text-[54px] xl:text-[60px] font-bold leading-[1.06] tracking-[-0.035em] text-[#111111] mb-6 text-balance">
              Build the revenue
              <br />
              system your business{" "}
              <span className="text-[#4f46e5]">actually needs.</span>
            </h1>

            <p className="text-[17px] text-[#6b7280] leading-[1.7] mb-8 max-w-[460px]">
              Meridian builds the operational infrastructure that connects
              marketing, sales, and CRM into a single, measurable growth engine.
              Not a retainer. A system.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] active:bg-[#000] transition-colors duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
              >
                Get Started
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-[#374151] border border-[#e5e7eb] rounded-md hover:border-[#d1d5db] hover:bg-[#f9fafb] transition-all duration-150"
              >
                <CalendarDays size={14} className="text-[#6b7280]" />
                Book a Call
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                "No lock-in contracts",
                "Response within 24 hours",
                "Results-backed guarantee",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-[12.5px] text-[#9ca3af]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="6" cy="6" r="5.5" stroke="#d1d5db" />
                    <path
                      d="M3.5 6L5.2 7.7L8.5 4.3"
                      stroke="#6b7280"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
