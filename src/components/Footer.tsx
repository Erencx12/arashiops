import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const footerLinks = {
  Product: [
    { label: "Pricing", href: "/pricing" },
    { label: "Results", href: "/results" },
    { label: "Solutions", href: "/#solutions" },
    { label: "Process", href: "/#process" },
  ],
  Company: [
    { label: "Book a Call", href: "/book" },
    { label: "Get Started", href: "/get-started" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-[#fafafa]">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* Main content */}
        <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto] gap-10 py-14 border-b border-[#e5e7eb]">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <LogoMark size="sm" />
              <span className="text-[14px] font-semibold text-[#111111]">Arashi OPS</span>
            </div>
            <p className="text-[13px] text-[#9ca3af] leading-relaxed max-w-[240px] mb-4">
              The revenue operating system for ambitious B2B businesses.
            </p>
            <a
              href="mailto:hello@meridian.co"
              className="text-[12.5px] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
            >
              hello@meridian.co
            </a>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-[11px] font-semibold text-[#374151] uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#6b7280] hover:text-[#111111] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5">
          <p className="text-[12px] text-[#9ca3af]">
            © {new Date().getFullYear()} Arashi OPS. All rights reserved.
          </p>
          <p className="text-[12px] text-[#9ca3af]">
            The Revenue Operating System
          </p>
        </div>
      </div>
    </footer>
  );
}
