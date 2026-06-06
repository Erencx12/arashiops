import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you were looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-32 min-h-[70vh]">
        <div className="max-w-[480px] w-full">
          {/* Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-[#fafafa] mb-8">
            <span className="text-[11px] font-semibold text-[#9ca3af] tracking-widest uppercase">
              404
            </span>
          </div>

          <h1 className="text-[42px] font-bold tracking-[-0.03em] text-[#111111] leading-tight mb-5">
            This page doesn&apos;t
            <br />
            exist.
          </h1>

          <p className="text-[16px] text-[#6b7280] leading-relaxed mb-10">
            The page you were looking for couldn&apos;t be found. It may have
            been moved, renamed, or never existed.
          </p>

          {/* Navigation options */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[14px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
            >
              <ArrowLeft size={14} />
              Return Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e5e7eb] text-[#374151] text-[14px] font-medium rounded-md hover:bg-[#f9fafb] hover:border-[#d1d5db] transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Helpful links */}
          <div className="border-t border-[#e5e7eb] pt-8">
            <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">
              Helpful pages
            </p>
            <ul className="space-y-1">
              {[
                { label: "Pricing & Packages", href: "/pricing" },
                { label: "Client Case Studies", href: "/results" },
                { label: "Book a Discovery Call", href: "/book" },
                { label: "Get Started", href: "/get-started" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between py-2.5 text-[13.5px] text-[#374151] hover:text-[#111111] transition-colors border-b border-[#f3f4f6] last:border-0"
                  >
                    <span>{link.label}</span>
                    <ArrowRight
                      size={13}
                      className="text-[#9ca3af] group-hover:text-[#6b7280] transition-colors"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
