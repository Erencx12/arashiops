// ─── Enums ────────────────────────────────────────────────────────────────────

export type Tier = "Silver" | "Gold" | "Platinum" | "Enterprise";
export type ClientStatus = "Active" | "Review" | "Paused" | "Churned" | "Suspended" | "Archived";
export type ProjectStatus = "Pending" | "Planning" | "Active" | "Review" | "Waiting On Client" | "Completed" | "Paused" | "Cancelled";
export type ApprovalStatus = "Pending" | "Approved" | "Revision Requested" | "Rejected";
export type DeliverableType = "Lead List" | "Campaign" | "Report" | "CRM Setup" | "Workflow" | "Playbook" | "Custom Asset" | "Script" | "Video" | "Asset";
export type DeliverableStatus = "Draft" | "Internal Review" | "Awaiting Approval" | "Approved" | "Revision Requested" | "Completed";
export type MeetingStatus = "Upcoming" | "Completed" | "Cancelled";
export type ContractStatus = "Draft" | "Sent" | "Signed" | "Active" | "Expired" | "Cancelled" | "Pending Signature";
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Partially Paid" | "Overdue" | "Cancelled";
export type AgentName = "Claude CEO" | "Claude CMO" | "Claude CFO";
export type AgentTaskStatus = "Active" | "Completed" | "Review" | "Pending";
export type LeadStatus = "Contacted" | "Responded" | "Meeting Booked" | "Qualified" | "Not Qualified" | "Closed Won";
export type ActivityType = "approval" | "upload" | "meeting" | "client" | "project" | "agent" | "task" | "onboarding" | "deal" | "invoice" | "payment";
export type UserRole = "owner" | "client";
export type OnboardingStatus = "Pending" | "In Progress" | "Waiting For Client" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed" | "Blocked";
export type MilestoneStatus = "Pending" | "In Progress" | "Completed" | "Blocked";
export type FileType = "PDF" | "CSV" | "Excel" | "Word" | "Image" | "ZIP" | "Video" | "Other";
export type NotificationType =
  | "client_created" | "onboarding_completed" | "project_created"
  | "deliverable_uploaded" | "approval_requested" | "approval_completed"
  | "project_completed" | "tier_upgraded" | "task_assigned"
  | "deal_won" | "deal_lost" | "proposal_sent" | "proposal_accepted"
  | "contract_signed" | "invoice_paid" | "invoice_overdue" | "renewal_due";

// Phase 6 enums
export type DealStage =
  | "Lead" | "Contacted" | "Discovery Scheduled" | "Discovery Completed"
  | "Proposal Sent" | "Negotiation" | "Won" | "Lost";
export type ProposalStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected" | "Expired";
export type PaymentMethod = "Bank Transfer" | "Card" | "Stripe" | "Cash" | "Other";
export type RenewalStatus = "Upcoming" | "At Risk" | "Renewed" | "Churned" | "Cancelled";

// Legacy alias used by agent system
export type ContentType = "Script" | "Video" | "Asset" | "Report" | "Campaign";

// ─── Table types ──────────────────────────────────────────────────────────────

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
  tags: string[];
  contract_status: string | null;
  internal_notes: string | null;
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
  agent: string;
  priority: TaskPriority;
  description: string | null;
  assigned_owner: string | null;
};

export type DbAgentTask = {
  id: number;
  agent: AgentName;
  task: string;
  status: AgentTaskStatus;
  output: string | null;
  created_at: string;
  completed_at: string | null;
  reviewed: boolean;
  approved: boolean;
};

export type DbApproval = {
  id: number;
  type: string;
  title: string;
  client_id: number;
  client_name: string;
  agent: string;
  status: ApprovalStatus;
  comment: string | null;
  client_comment: string | null;
  deliverable_id: number | null;
  created_at: string;
};

export type DbContentItem = {
  id: number;
  client_id: number;
  client_name: string;
  type: string;
  title: string;
  size_label: string;
  tags: string[];
  status: DeliverableStatus;
  version: string;
  project_id: number | null;
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
  deal_id: number | null;
  proposal_id: number | null;
  contract_number: string | null;
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
  description: string | null;
  deal_id: number | null;
  proposal_id: number | null;
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
  password_hash: string;
  role: UserRole;
  client_id: number | null;
  status: "active" | "invited" | "suspended";
  created_at: string;
  last_login: string | null;
};

export type DbInviteToken = {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
};

export type DbPasswordResetToken = {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
};

// ─── Phase 5 types ────────────────────────────────────────────────────────────

export type DbOnboardingForm = {
  id: number;
  client_id: number;
  company_name: string | null;
  industry: string | null;
  website: string | null;
  target_market: string | null;
  ideal_customer_profile: string | null;
  average_deal_size: string | null;
  current_crm: string | null;
  sales_team_size: string | null;
  current_outreach_process: string | null;
  business_goals: string | null;
  monthly_revenue_range: string | null;
  primary_challenges: string | null;
  additional_notes: string | null;
  submitted_at: string | null;
  created_at: string;
};

export type DbOnboardingProgress = {
  id: number;
  client_id: number;
  status: OnboardingStatus;
  profile_setup: boolean;
  business_information: boolean;
  icp_information: boolean;
  sales_information: boolean;
  requirements_submitted: boolean;
  kickoff_scheduled: boolean;
  completed_at: string | null;
  created_at: string;
};

export type DbProjectMilestone = {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: MilestoneStatus;
  completed_at: string | null;
  created_at: string;
};

export type DbTask = {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string | null;
  client_id: number | null;
  client_name: string | null;
  project_id: number | null;
  project_title: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
};

export type DbFile = {
  id: number;
  name: string;
  file_type: FileType;
  size_label: string;
  url: string | null;
  client_id: number | null;
  client_name: string | null;
  project_id: number | null;
  uploaded_by: string;
  version: string;
  created_at: string;
};

export type DbNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  client_id: number | null;
  read: boolean;
  created_at: string;
};

export type DbClientNote = {
  id: number;
  client_id: number;
  content: string;
  is_internal: boolean;
  created_by: string;
  created_at: string;
};

// ─── Phase 6 types ────────────────────────────────────────────────────────────

export type DbDeal = {
  id: number;
  company: string;
  contact_name: string;
  contact_email: string | null;
  deal_value: number;
  stage: DealStage;
  owner: string;
  expected_close_date: string | null;
  notes: string | null;
  client_id: number | null;
  created_at: string;
  updated_at: string;
};

export type DbDiscoveryCall = {
  id: number;
  deal_id: number | null;
  deal_company: string | null;
  company: string;
  contact_name: string;
  call_date: string | null;
  meeting_notes: string | null;
  pain_points: string | null;
  requirements: string | null;
  budget: string | null;
  decision_timeline: string | null;
  next_action: string | null;
  created_at: string;
};

export type DbProposal = {
  id: number;
  deal_id: number | null;
  deal_company: string | null;
  client_id: number | null;
  client_name: string | null;
  title: string;
  status: ProposalStatus;
  package: string;
  monthly_value: number;
  setup_fee: number;
  deliverables: string | null;
  terms: string | null;
  timeline: string | null;
  notes: string | null;
  version: number;
  sent_at: string | null;
  accepted_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbPayment = {
  id: number;
  invoice_id: number | null;
  invoice_number: string | null;
  client_id: number | null;
  client_name: string | null;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

export type DbRenewal = {
  id: number;
  client_id: number;
  client_name: string;
  contract_id: number | null;
  renewal_date: string | null;
  status: RenewalStatus;
  monthly_value: number | null;
  notes: string | null;
  created_at: string;
};
