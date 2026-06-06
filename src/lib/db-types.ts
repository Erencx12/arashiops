export type Tier = "Silver" | "Gold" | "Platinum";
export type ClientStatus = "Active" | "Review" | "Paused" | "Churned";
export type ProjectStatus = "Pending" | "Active" | "Review" | "Completed" | "Paused";
export type ApprovalStatus = "Pending" | "Approved" | "Revision Requested" | "Rejected";
export type ContentType = "Script" | "Video" | "Asset" | "Report" | "Campaign";
export type MeetingStatus = "Upcoming" | "Completed" | "Cancelled";
export type ContractStatus = "Active" | "Draft" | "Expired" | "Pending Signature";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft";
export type AgentName = "Claude CEO" | "Claude CMO" | "Claude CFO";
export type TaskStatus = "Active" | "Completed" | "Review" | "Pending";
export type LeadStatus = "Contacted" | "Responded" | "Meeting Booked" | "Qualified" | "Not Qualified" | "Closed Won";
export type ActivityType = "approval" | "upload" | "meeting" | "client" | "project" | "agent";
export type UserRole = "owner" | "client";

export type DbClient = {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  tier: Tier;
  status: ClientStatus;
  monthly_value: number;
  industry: string;
  owner: string;
  health_score: number;
  renewal_date: string;
  start_date: string;
  created_at: string;
};

export type DbProject = {
  id: number;
  client_id: number;
  client_name: string;
  title: string;
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  deadline: string;
  agent: AgentName;
};

export type DbAgentTask = {
  id: number;
  agent: AgentName;
  task: string;
  status: TaskStatus;
  output: string | null;
  created_at: string;
  completed_at: string | null;
  reviewed: boolean;
  approved: boolean;
};

export type DbApproval = {
  id: number;
  type: ContentType | "Research";
  title: string;
  client_id: number;
  client_name: string;
  agent: AgentName;
  status: ApprovalStatus;
  comment: string | null;
  created_at: string;
};

export type DbContentItem = {
  id: number;
  client_id: number;
  client_name: string;
  type: ContentType;
  title: string;
  size_label: string;
  tags: string[];
  created_at: string;
};

export type DbMeeting = {
  id: number;
  client_id: number | null;
  client_name: string;
  title: string;
  type: string;
  meeting_date: string;
  meeting_time: string;
  status: MeetingStatus;
  notes: string | null;
  duration: string;
};

export type DbContract = {
  id: number;
  client_id: number;
  client_name: string;
  type: string;
  tier: Tier;
  status: ContractStatus;
  signed_date: string | null;
  start_date: string;
  end_date: string;
  monthly_value: number;
};

export type DbInvoice = {
  id: number;
  invoice_number: string;
  client_id: number;
  client_name: string;
  tier: Tier;
  amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
};

export type DbLead = {
  id: number;
  client_id: number;
  name: string;
  company: string;
  email: string | null;
  source: string;
  status: LeadStatus;
  estimated_value: string | null;
  created_at: string;
};

export type DbMrrHistory = {
  id: number;
  month_label: string;
  month_year: string;
  value: number;
};

export type DbSalesFunnel = {
  id: number;
  stage: string;
  count: number;
  prev_count: number;
  sort_order: number;
};

export type DbActivity = {
  id: number;
  type: ActivityType;
  description: string;
  created_at: string;
};

export type DbUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};
