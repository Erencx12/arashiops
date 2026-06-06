// ─── Types ────────────────────────────────────────────────────────────────────

export type Tier = "Silver" | "Gold" | "Platinum";
export type ClientStatus = "Active" | "Review" | "Paused" | "Churned";
export type ProjectStatus = "Pending" | "Active" | "Review" | "Completed" | "Paused";
export type AgentName = "Claude CEO" | "Claude CMO" | "Claude CFO";
export type TaskStatus = "Active" | "Completed" | "Review" | "Pending";
export type ApprovalStatus = "Pending" | "Approved" | "Revision Requested" | "Rejected";
export type ContentType = "Script" | "Video" | "Asset" | "Report" | "Campaign";
export type MeetingStatus = "Upcoming" | "Completed" | "Cancelled";
export type ContractStatus = "Active" | "Draft" | "Expired" | "Pending Signature";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft";

export type Client = {
  id: number;
  name: string;
  tier: Tier;
  status: ClientStatus;
  startDate: string;
  monthlyValue: number;
  owner: string;
  healthScore: number;
  renewal: string;
  email: string;
  industry: string;
};

export type Project = {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  status: ProjectStatus;
  deadline: string;
  progress: number;
  agent: AgentName;
};

export type AgentTask = {
  id: number;
  agent: AgentName;
  task: string;
  status: TaskStatus;
  output: string | null;
  created: string;
  completed: string | null;
  reviewed: boolean;
  approved: boolean;
};

export type Approval = {
  id: number;
  type: ContentType | "Research";
  title: string;
  client: string;
  agent: AgentName;
  created: string;
  status: ApprovalStatus;
};

export type ContentItem = {
  id: number;
  type: ContentType;
  title: string;
  client: string;
  created: string;
  size: string;
  tags: string[];
};

export type Meeting = {
  id: number;
  title: string;
  client: string;
  type: string;
  date: string;
  time: string;
  status: MeetingStatus;
  notes: string | null;
  duration: string;
};

export type Contract = {
  id: number;
  client: string;
  type: string;
  status: ContractStatus;
  signedDate: string | null;
  startDate: string;
  endDate: string;
  value: number;
  tier: Tier;
};

export type Invoice = {
  id: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  tier: Tier;
};

export type Activity = {
  id: number;
  type: "approval" | "upload" | "meeting" | "client" | "project" | "agent";
  description: string;
  time: string;
};

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clients: Client[] = [
  { id: 1, name: "Axiom Capital", tier: "Platinum", status: "Active", startDate: "Jan 2026", monthlyValue: 7500, owner: "Soham Das", healthScore: 92, renewal: "Jan 2027", email: "ops@axiomcapital.io", industry: "Financial Services" },
  { id: 2, name: "Relay Software", tier: "Gold", status: "Active", startDate: "Feb 2026", monthlyValue: 4500, owner: "Soham Das", healthScore: 88, renewal: "Feb 2027", email: "growth@relaysoftware.com", industry: "B2B SaaS" },
  { id: 3, name: "Compound Studio", tier: "Silver", status: "Active", startDate: "Mar 2026", monthlyValue: 1500, owner: "Soham Das", healthScore: 75, renewal: "Mar 2027", email: "hello@compoundstudio.co", industry: "Creative Services" },
  { id: 4, name: "Threshold AI", tier: "Gold", status: "Review", startDate: "Dec 2025", monthlyValue: 4500, owner: "Soham Das", healthScore: 62, renewal: "Dec 2026", email: "team@thresholdai.com", industry: "AI / ML" },
  { id: 5, name: "Vantage Commerce", tier: "Silver", status: "Active", startDate: "Apr 2026", monthlyValue: 1500, owner: "Soham Das", healthScore: 81, renewal: "Apr 2027", email: "ops@vantagecommerce.co", industry: "E-Commerce" },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  { id: 1, name: "Q2 Outbound System", clientId: 1, clientName: "Axiom Capital", status: "Active", deadline: "Jun 30, 2026", progress: 72, agent: "Claude CMO" },
  { id: 2, name: "CRM Architecture", clientId: 2, clientName: "Relay Software", status: "Active", deadline: "Jul 15, 2026", progress: 45, agent: "Claude CEO" },
  { id: 3, name: "Content Engine Setup", clientId: 3, clientName: "Compound Studio", status: "Review", deadline: "Jun 20, 2026", progress: 88, agent: "Claude CMO" },
  { id: 4, name: "Revenue Attribution Model", clientId: 1, clientName: "Axiom Capital", status: "Active", deadline: "Jul 1, 2026", progress: 30, agent: "Claude CFO" },
  { id: 5, name: "ICP Definition Sprint", clientId: 4, clientName: "Threshold AI", status: "Completed", deadline: "Jun 10, 2026", progress: 100, agent: "Claude CEO" },
  { id: 6, name: "Email Sequence Build", clientId: 5, clientName: "Vantage Commerce", status: "Pending", deadline: "Jul 10, 2026", progress: 15, agent: "Claude CMO" },
  { id: 7, name: "Referral Programme Design", clientId: 5, clientName: "Vantage Commerce", status: "Pending", deadline: "Jul 20, 2026", progress: 0, agent: "Claude CEO" },
  { id: 8, name: "Pipeline Review", clientId: 4, clientName: "Threshold AI", status: "Paused", deadline: "Jun 28, 2026", progress: 40, agent: "Claude CFO" },
];

// ─── Agent Tasks ──────────────────────────────────────────────────────────────

export const agentTasks: AgentTask[] = [
  { id: 1, agent: "Claude CEO", task: "ICP Analysis — Axiom Capital", status: "Completed", output: "12-page ICP playbook with 3 buyer segments identified", created: "Jun 1, 2026", completed: "Jun 3, 2026", reviewed: true, approved: true },
  { id: 2, agent: "Claude CMO", task: "Email Sequence Draft — Relay Software", status: "Review", output: "7-touch email sequence across 42 email variants", created: "Jun 4, 2026", completed: "Jun 5, 2026", reviewed: false, approved: false },
  { id: 3, agent: "Claude CFO", task: "Revenue Attribution Report — Q2", status: "Completed", output: "Pipeline analysis and multi-touch attribution model", created: "Jun 2, 2026", completed: "Jun 4, 2026", reviewed: true, approved: true },
  { id: 4, agent: "Claude CMO", task: "LinkedIn Content Calendar — Compound Studio", status: "Active", output: null, created: "Jun 5, 2026", completed: null, reviewed: false, approved: false },
  { id: 5, agent: "Claude CEO", task: "Onboarding Brief — Vantage Commerce", status: "Active", output: null, created: "Jun 5, 2026", completed: null, reviewed: false, approved: false },
  { id: 6, agent: "Claude CFO", task: "Financial Baseline — Threshold AI", status: "Review", output: "Current state financials and growth gap analysis", created: "Jun 3, 2026", completed: "Jun 5, 2026", reviewed: false, approved: false },
  { id: 7, agent: "Claude CMO", task: "Campaign Brief — Axiom Capital Q3", status: "Pending", output: null, created: "Jun 6, 2026", completed: null, reviewed: false, approved: false },
];

// ─── Approvals ────────────────────────────────────────────────────────────────

export const approvals: Approval[] = [
  { id: 1, type: "Script", title: "Discovery Call Script v2 — Relay Software", client: "Relay Software", agent: "Claude CMO", created: "Jun 5, 2026", status: "Pending" },
  { id: 2, type: "Report", title: "Monthly Performance Report — May 2026", client: "Axiom Capital", agent: "Claude CFO", created: "Jun 4, 2026", status: "Pending" },
  { id: 3, type: "Asset", title: "LinkedIn Banner Set — Compound Studio", client: "Compound Studio", agent: "Claude CMO", created: "Jun 2, 2026", status: "Approved" },
  { id: 4, type: "Video", title: "Explainer Script Draft — Vantage Commerce", client: "Vantage Commerce", agent: "Claude CMO", created: "Jun 1, 2026", status: "Revision Requested" },
  { id: 5, type: "Research", title: "Competitor Analysis — Threshold AI", client: "Threshold AI", agent: "Claude CEO", created: "May 30, 2026", status: "Approved" },
  { id: 6, type: "Report", title: "Financial Gap Analysis — Threshold AI", client: "Threshold AI", agent: "Claude CFO", created: "Jun 5, 2026", status: "Pending" },
];

// ─── Content Library ──────────────────────────────────────────────────────────

export const contentItems: ContentItem[] = [
  { id: 1, type: "Script", title: "Cold Email Sequence — Financial Services ICP", client: "Axiom Capital", created: "Jun 3, 2026", size: "24 KB", tags: ["outbound", "email"] },
  { id: 2, type: "Report", title: "Q1 2026 Revenue Attribution Report", client: "Axiom Capital", created: "Jun 4, 2026", size: "1.2 MB", tags: ["finance", "analytics"] },
  { id: 3, type: "Asset", title: "LinkedIn Profile Banners — Partner Set", client: "Compound Studio", created: "Jun 2, 2026", size: "3.4 MB", tags: ["design", "linkedin"] },
  { id: 4, type: "Video", title: "Product Demo Script — SaaS Buyer Persona", client: "Relay Software", created: "Jun 1, 2026", size: "18 KB", tags: ["video", "demo"] },
  { id: 5, type: "Campaign", title: "Q2 Outbound Campaign Package", client: "Axiom Capital", created: "May 28, 2026", size: "890 KB", tags: ["campaign", "outbound"] },
  { id: 6, type: "Script", title: "LinkedIn DM Sequence — Decision Makers", client: "Relay Software", created: "May 25, 2026", size: "16 KB", tags: ["linkedin", "outbound"] },
  { id: 7, type: "Report", title: "ICP Playbook — 3 Buyer Segments", client: "Relay Software", created: "May 20, 2026", size: "2.1 MB", tags: ["strategy", "icp"] },
  { id: 8, type: "Asset", title: "Email Signature Templates", client: "Vantage Commerce", created: "May 18, 2026", size: "240 KB", tags: ["design", "email"] },
];

// ─── Meetings ─────────────────────────────────────────────────────────────────

export const meetings: Meeting[] = [
  { id: 1, title: "Monthly Review — Axiom Capital", client: "Axiom Capital", type: "Monthly Review", date: "Jun 10, 2026", time: "2:00 PM", status: "Upcoming", notes: null, duration: "60 min" },
  { id: 2, title: "Strategy Session — Relay Software", client: "Relay Software", type: "Strategy", date: "Jun 12, 2026", time: "10:00 AM", status: "Upcoming", notes: null, duration: "45 min" },
  { id: 3, title: "Onboarding — Vantage Commerce", client: "Vantage Commerce", type: "Onboarding", date: "Jun 8, 2026", time: "3:00 PM", status: "Upcoming", notes: null, duration: "45 min" },
  { id: 4, title: "Quarterly Review — Threshold AI", client: "Threshold AI", type: "Quarterly Review", date: "May 28, 2026", time: "11:00 AM", status: "Completed", notes: "Discussed ICP refinement and new target verticals. Agreed to pause pipeline work pending new direction.", duration: "60 min" },
  { id: 5, title: "Check-in — Compound Studio", client: "Compound Studio", type: "Check-in", date: "May 22, 2026", time: "4:00 PM", status: "Completed", notes: "Content calendar approved. Start date confirmed for Jun 1.", duration: "30 min" },
  { id: 6, title: "Discovery — Inbound Lead", client: "—", type: "Discovery", date: "Jun 14, 2026", time: "1:00 PM", status: "Upcoming", notes: null, duration: "45 min" },
];

// ─── Contracts ────────────────────────────────────────────────────────────────

export const contracts: Contract[] = [
  { id: 1, client: "Axiom Capital", type: "Platinum Engagement", status: "Active", signedDate: "Jan 3, 2026", startDate: "Jan 5, 2026", endDate: "Jan 5, 2027", value: 7500, tier: "Platinum" },
  { id: 2, client: "Relay Software", type: "Gold Engagement", status: "Active", signedDate: "Feb 2, 2026", startDate: "Feb 5, 2026", endDate: "Feb 5, 2027", value: 4500, tier: "Gold" },
  { id: 3, client: "Compound Studio", type: "Silver Engagement", status: "Active", signedDate: "Mar 4, 2026", startDate: "Mar 7, 2026", endDate: "Mar 7, 2027", value: 1500, tier: "Silver" },
  { id: 4, client: "Threshold AI", type: "Gold Engagement", status: "Active", signedDate: "Dec 1, 2025", startDate: "Dec 5, 2025", endDate: "Dec 5, 2026", value: 4500, tier: "Gold" },
  { id: 5, client: "Vantage Commerce", type: "Silver Engagement", status: "Active", signedDate: "Apr 7, 2026", startDate: "Apr 10, 2026", endDate: "Apr 10, 2027", value: 1500, tier: "Silver" },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const invoices: Invoice[] = [
  { id: "INV-0012", client: "Axiom Capital", amount: 7500, status: "Paid", issueDate: "Jun 1, 2026", dueDate: "Jun 7, 2026", paidDate: "Jun 3, 2026", tier: "Platinum" },
  { id: "INV-0011", client: "Relay Software", amount: 4500, status: "Paid", issueDate: "Jun 1, 2026", dueDate: "Jun 7, 2026", paidDate: "Jun 5, 2026", tier: "Gold" },
  { id: "INV-0010", client: "Compound Studio", amount: 1500, status: "Pending", issueDate: "Jun 1, 2026", dueDate: "Jun 8, 2026", paidDate: null, tier: "Silver" },
  { id: "INV-0009", client: "Threshold AI", amount: 4500, status: "Overdue", issueDate: "Jun 1, 2026", dueDate: "Jun 7, 2026", paidDate: null, tier: "Gold" },
  { id: "INV-0008", client: "Vantage Commerce", amount: 1500, status: "Pending", issueDate: "Jun 1, 2026", dueDate: "Jun 8, 2026", paidDate: null, tier: "Silver" },
  { id: "INV-0007", client: "Axiom Capital", amount: 7500, status: "Paid", issueDate: "May 1, 2026", dueDate: "May 7, 2026", paidDate: "May 4, 2026", tier: "Platinum" },
  { id: "INV-0006", client: "Relay Software", amount: 4500, status: "Paid", issueDate: "May 1, 2026", dueDate: "May 7, 2026", paidDate: "May 6, 2026", tier: "Gold" },
];

// ─── Activity Feed ─────────────────────────────────────────────────────────────

export const recentActivity: Activity[] = [
  { id: 1, type: "approval", description: "Monthly Performance Report approved — Axiom Capital", time: "2h ago" },
  { id: 2, type: "agent", description: "Claude CMO completed Email Sequence Draft for Relay Software", time: "4h ago" },
  { id: 3, type: "meeting", description: "Onboarding call scheduled with Vantage Commerce", time: "5h ago" },
  { id: 4, type: "client", description: "Vantage Commerce onboarded as Silver client", time: "1d ago" },
  { id: 5, type: "upload", description: "ICP Playbook uploaded to Relay Software content library", time: "1d ago" },
  { id: 6, type: "project", description: "ICP Definition Sprint marked complete — Threshold AI", time: "2d ago" },
  { id: 7, type: "approval", description: "LinkedIn Banner Set approved — Compound Studio", time: "4d ago" },
  { id: 8, type: "agent", description: "Claude CFO delivered Revenue Attribution Report", time: "2d ago" },
];

// ─── Metrics ──────────────────────────────────────────────────────────────────

export const mrrHistory = [
  { month: "Jan", value: 8500 },
  { month: "Feb", value: 12000 },
  { month: "Mar", value: 13500 },
  { month: "Apr", value: 16000 },
  { month: "May", value: 18000 },
  { month: "Jun", value: 19500 },
];

export const salesFunnel = [
  { stage: "Discovery Calls", count: 14, prev: 9 },
  { stage: "Proposals Sent", count: 8, prev: 5 },
  { stage: "Deals Won", count: 5, prev: 3 },
  { stage: "Deals Lost", count: 3, prev: 2 },
];
