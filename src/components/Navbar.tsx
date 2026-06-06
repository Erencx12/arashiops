"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/Logo";

const navLinks = [
  { label: "Solutions", href: "/#solutions" },
  { label: "Process", href: "/#process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Results", href: "/results" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow] duration-200 border-b border-[#e5e7eb] ${
        scrolled ? "bg-white/96 backdrop-blur-md" : "bg-white"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Meridian — Home"
          >
            <LogoMark size="md" />
            <span className="text-[15px] font-semibold tracking-tight text-[#111111]">
              Meridian
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-[13.5px] text-[#6b7280] hover:text-[#111111] transition-colors duration-150 rounded-md hover:bg-[#f3f4f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/book"
              className="text-[13.5px] text-[#6b7280] hover:text-[#111111] transition-colors duration-150"
            >
              Book a Call
            </Link>
            <Link
              href="/get-started"
              className="px-3.5 py-1.5 bg-[#111111] text-white text-[13.5px] font-medium rounded-md hover:bg-[#1a1a1a] active:bg-black transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1.5 text-[#6b7280] hover:text-[#111111] transition-colors rounded-md hover:bg-[#f3f4f6]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e5e7eb] bg-white">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2.5 px-3 text-[14px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-[#e5e7eb] flex flex-col gap-2">
              <Link
                href="/book"
                className="py-2.5 px-3 text-[14px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Book a Call
              </Link>
              <Link
                href="/get-started"
                className="py-2.5 px-4 bg-[#111111] text-white text-[14px] font-medium rounded-md text-center hover:bg-[#1a1a1a] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
