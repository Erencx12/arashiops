"use client";
import { DashboardShell, type NavSection } from "@/components/dashboard/DashboardShell";
import {
  LayoutDashboard, Package, CheckSquare, BarChart2,
  FolderOpen, Target, DollarSign, Settings, Lock,
} from "lucide-react";

// Demo context: Relay Software — Gold tier
// Gold can see: Overview, Deliverables, Approvals, Files, Leads
// Hidden (Platinum only): Revenue Dashboard

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Overview", href: "/client", icon: LayoutDashboard },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Deliverables", href: "/client/deliverables", icon: Package },
      { label: "Approvals",    href: "/client/approvals",   icon: CheckSquare, badge: 2 },
      { label: "Files",        href: "/client/files",       icon: FolderOpen },
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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navSections={navSections}
      role="client"
      userName="Relay Software"
      userSub="Gold Plan"
    >
      {children}
    </DashboardShell>
  );
}
