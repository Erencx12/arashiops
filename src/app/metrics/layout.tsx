"use client";
import { DashboardShell, type NavSection } from "@/components/dashboard/DashboardShell";
import {
  LayoutDashboard, TrendingUp, Users, FolderKanban, Bot,
  CheckSquare, FileText, Video, FileCheck, Receipt, Settings,
} from "lucide-react";

const navSections: NavSection[] = [
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
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Agents",    href: "/admin/agents",    icon: Bot },
      { label: "Approvals", href: "/admin/approvals", icon: CheckSquare, badge: 3 },
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
    label: "Finance",
    items: [
      { label: "Contracts", href: "/admin/contracts", icon: FileCheck },
      { label: "Invoices",  href: "/admin/invoices",  icon: Receipt },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function MetricsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navSections={navSections}
      role="owner"
      userName="Soham Das"
      userSub="Owner"
    >
      {children}
    </DashboardShell>
  );
}
