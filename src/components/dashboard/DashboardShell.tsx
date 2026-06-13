"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lock, ExternalLink,
  LayoutDashboard, TrendingUp, Users, FolderKanban, Bot,
  SquareCheckBig, FileText, Video, FileCheck, Receipt, Settings,
  Package, BarChart2, FolderOpen, Target, DollarSign, ListTodo, ClipboardList,
  Handshake, Phone,
  Plug, Cpu, ScrollText, Zap, Server, Rocket, BookOpen, LifeBuoy, TestTube,
  Brain, Sparkles, Search, Lightbulb,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "./Badge";
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
      { label: "Approvals", href: "/admin/approvals", icon: SquareCheckBig },
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
      { label: "Billing",   href: "/admin/billing",   icon: CreditCard },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
      { label: "Jobs",         href: "/admin/jobs",         icon: Cpu },
      { label: "Logs",         href: "/admin/logs",         icon: ScrollText },
      { label: "Webhooks",     href: "/admin/webhooks",     icon: Zap },
      { label: "System",       href: "/admin/system",       icon: Server },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "AI Hub",       href: "/admin/ai",          icon: Brain },
      { label: "Lead Scoring", href: "/admin/ai/leads",    icon: Sparkles },
      { label: "Research",     href: "/admin/ai/research", icon: Search },
      { label: "Insights",     href: "/admin/ai/insights", icon: Lightbulb },
      { label: "Prompts",      href: "/admin/ai/prompts",  icon: BookOpen },
    ],
  },
  {
    label: "Launch",
    items: [
      { label: "Launch Center", href: "/admin/launch",  icon: Rocket },
      { label: "SOPs",          href: "/admin/sops",    icon: BookOpen },
      { label: "Docs",          href: "/admin/docs",    icon: FileText },
      { label: "Testing",       href: "/admin/testing", icon: TestTube },
      { label: "Support",       href: "/admin/support", icon: LifeBuoy },
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

function buildClientNav(revenueUnlocked: boolean): NavSection[] {
  return [
    {
      label: "Overview",
      items: [
        { label: "Overview",           href: "/client",         icon: LayoutDashboard },
        { label: "Revenue Dashboard",  href: "/client/revenue", icon: DollarSign, locked: !revenueUnlocked },
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
        { label: "Approvals",    href: "/client/approvals",    icon: SquareCheckBig },
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
      label: "Billing",
      items: [
        { label: "Billing & Plans", href: "/client/billing", icon: CreditCard },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Settings", href: "/client/settings", icon: Settings },
      ],
    },
  ];
}

type Props = {
  role: "owner" | "client";
  userName: string;
  userSub: string;
  userTier?: string;
  pendingApprovals?: number;
  children: React.ReactNode;
};

export function DashboardShell({ role, userName, userSub, userTier, pendingApprovals, children }: Props) {
  const pathname = usePathname();
  const revenueUnlocked = userTier === "Gold" || userTier === "Enterprise";
  const ownerNav = OWNER_NAV.map(section => ({
    ...section,
    items: section.items.map(item =>
      item.href === "/admin/approvals"
        ? { ...item, badge: pendingApprovals && pendingApprovals > 0 ? pendingApprovals : undefined }
        : item
    ),
  }));
  const navSections = role === "owner" ? ownerNav : buildClientNav(revenueUnlocked);

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
                const EXACT_ONLY = ["/admin", "/metrics", "/client", "/admin/ai"];
                const isActive =
                  pathname === item.href ||
                  (!EXACT_ONLY.includes(item.href) && pathname.startsWith(item.href));
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
              {userTier ? (
                <div className="mt-0.5">
                  <Badge label={userTier} />
                </div>
              ) : (
                <p className="text-[10.5px] text-[#9ca3af] truncate leading-tight">
                  {userSub}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
