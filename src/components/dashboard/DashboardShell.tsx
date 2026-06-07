"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lock, ExternalLink,
  LayoutDashboard, TrendingUp, Users, FolderKanban, Bot,
  SquareCheckBig, FileText, Video, FileCheck, Receipt, Settings,
  Package, BarChart2, FolderOpen, Target, DollarSign, ListTodo, ClipboardList,
  Handshake, Phone,
  Plug, Cpu, ScrollText, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { LogoutButton } from "./LogoutButton";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  locked?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const OWNER_NAV: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/admin",   icon: LayoutDashboard },
      { label: "Metrics",  href: "/metrics", icon: TrendingUp },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "All Clients", href: "/admin/clients",  icon: Users },
      { label: "Projects",    href: "/admin/projects", icon: FolderKanban },
      { label: "Tasks",       href: "/admin/tasks",    icon: ListTodo },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Agents",    href: "/admin/agents",    icon: Bot },
      { label: "Approvals", href: "/admin/approvals", icon: SquareCheckBig, badge: 3 },
      { label: "Content",   href: "/admin/content",   icon: FileText },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Meetings", href: "/admin/meetings", icon: Video },
    ],
  },
  {
    label: "Commercial",
    items: [
      { label: "Deals",      href: "/admin/deals",      icon: Handshake },
      { label: "Discovery",  href: "/admin/discovery",  icon: Phone },
      { label: "Proposals",  href: "/admin/proposals",  icon: FileText },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Contracts", href: "/admin/contracts", icon: FileCheck },
      { label: "Invoices",  href: "/admin/invoices",  icon: Receipt },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
      { label: "Jobs",         href: "/admin/jobs",         icon: Cpu },
      { label: "Logs",         href: "/admin/logs",         icon: ScrollText },
      { label: "Webhooks",     href: "/admin/webhooks",     icon: Zap },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "Preview",
    items: [
      { label: "Client Portal", href: "/client", icon: LayoutDashboard },
    ],
  },
];

const CLIENT_NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Overview", href: "/client", icon: LayoutDashboard },
    ],
  },
  {
    label: "Getting Started",
    items: [
      { label: "Onboarding", href: "/client/onboarding", icon: ClipboardList },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Deliverables", href: "/client/deliverables", icon: Package },
      { label: "Approvals",    href: "/client/approvals",    icon: SquareCheckBig, badge: 2 },
      { label: "Files",        href: "/client/files",        icon: FolderOpen },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Reports",      href: "/client/reports", icon: BarChart2 },
      { label: "Lead Tracker", href: "/client/leads",   icon: Target },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Revenue Dashboard", href: "/client/revenue", icon: DollarSign, locked: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/client/settings", icon: Settings },
    ],
  },
];

type Props = {
  role: "owner" | "client";
  userName: string;
  userSub: string;
  children: React.ReactNode;
};

export function DashboardShell({ role, userName, userSub, children }: Props) {
  const pathname = usePathname();
  const navSections = role === "owner" ? OWNER_NAV : CLIENT_NAV;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-[#e5e7eb] flex flex-col">
        {/* Logo */}
        <div className="h-[52px] border-b border-[#e5e7eb] flex items-center gap-2.5 px-4 shrink-0">
          <LogoMark size="sm" />
          <span className="text-[13px] font-semibold text-[#111111] tracking-tight">
            Arashi OPS
          </span>
          <span className="ml-auto text-[9.5px] font-semibold text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded uppercase tracking-wider">
            {role === "owner" ? "OS" : "Portal"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {navSections.map((section, si) => (
            <div key={section.label} className={si > 0 ? "mt-4" : ""}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] px-2 mb-1">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" &&
                    item.href !== "/metrics" &&
                    item.href !== "/client" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.locked ? "#" : item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors mb-0.5 group ${
                      item.locked
                        ? "text-[#d1d5db] cursor-not-allowed pointer-events-none"
                        : isActive
                        ? "text-[#111111] bg-[#f3f4f6]"
                        : "text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6]"
                    }`}
                  >
                    <item.icon
                      size={14}
                      strokeWidth={isActive ? 2 : 1.75}
                      className="shrink-0"
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && !item.locked && (
                      <span className="text-[10px] font-semibold text-white bg-[#111111] px-1.5 py-0.5 rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                    {item.locked && (
                      <Lock size={10} className="text-[#d1d5db] shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#e5e7eb] p-3 shrink-0 space-y-1">
          {role === "owner" && (
            <Link
              href="/"
              className="flex items-center gap-2 px-2.5 py-[7px] rounded-md text-[12.5px] text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
            >
              <ExternalLink size={12} />
              <span>Back to website</span>
            </Link>
          )}
          <LogoutButton />
          <div className="flex items-center gap-2.5 px-2.5 py-[7px]">
            <div className="w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#111111] truncate leading-tight">
                {userName}
              </p>
              <p className="text-[10.5px] text-[#9ca3af] truncate leading-tight">
                {userSub}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
