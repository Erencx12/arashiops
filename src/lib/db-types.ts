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

// ─── Phase 7 enums ────────────────────────────────────────────────────────────

export type IntegrationStatus = "Connected" | "Disconnected" | "Error" | "Pending";
export type JobStatus = "Queued" | "Running" | "Completed" | "Failed" | "Retrying" | "Cancelled";
export type LogLevel = "info" | "warn" | "error" | "debug";
export type LogEventType = "system" | "user" | "integration" | "webhook" | "automation" | "security";
export type QueueType = "incoming" | "outgoing" | "scheduled" | "retry";
export type WebhookStatus = "Active" | "Inactive" | "Error";
export type CredentialStatus = "active" | "disabled" | "expired";

// ─── Phase 7 table types ──────────────────────────────────────────────────────

export type DbIntegration = {
  id: number;
  name: string;
  slug: string;
  category: string;
  status: IntegrationStatus;
  enabled: boolean;
  last_sync: string | null;
  last_error: string | null;
  health_score: number;
  created_at: string;
  updated_at: string;
};

export type DbIntegrationCredential = {
  id: number;
  integration_id: number | null;
  integration_name: string | null;
  service: string;
  key_label: string;
  key_masked: string;
  status: CredentialStatus;
  created_at: string;
  updated_at: string;
};

export type DbWebhook = {
  id: number;
  name: string;
  source: string;
  endpoint: string;
  status: WebhookStatus;
  secret: string | null;
  last_trigger: string | null;
  trigger_count: number;
  created_at: string;
};

export type DbWebhookLog = {
  id: number;
  webhook_id: number | null;
  webhook_name: string | null;
  timestamp: string;
  source: string | null;
  payload_size: number;
  response_status: number | null;
  success: boolean;
  retry_count: number;
  error_message: string | null;
};

export type DbJob = {
  id: number;
  name: string;
  source: string | null;
  client_id: number | null;
  client_name: string | null;
  status: JobStatus;
  queue_type: QueueType;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  payload: string | null;
};

export type DbSystemLog = {
  id: number;
  event_type: LogEventType;
  level: LogLevel;
  message: string;
  module: string | null;
  client_id: number | null;
  client_name: string | null;
  job_id: number | null;
  webhook_id: number | null;
  metadata: string | null;
  created_at: string;
};

export type DbQueueItem = {
  id: number;
  queue_type: QueueType;
  job_id: number | null;
  status: "pending" | "processing" | "done" | "failed";
  payload: string | null;
  scheduled_at: string | null;
  created_at: string;
};

// ─── Phase 8 enums ────────────────────────────────────────────────────────────

export type EmailStatus = "Sent" | "Failed" | "Bounced";
export type SyncStatus = "Running" | "Success" | "Failed";
export type IntegrationCategory = "email" | "crm" | "prospecting" | "outreach" | "automation" | "ai" | "other";

// ─── Phase 8 table types ──────────────────────────────────────────────────────

export type DbEmailConfig = {
  id: number;
  provider: string;
  integration_id: number | null;
  smtp_host: string | null;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string | null;
  from_name: string;
  from_email: string;
  is_active: boolean;
  last_test_at: string | null;
  last_test_success: boolean | null;
  created_at: string;
  updated_at: string;
};

export type DbEmailLog = {
  id: number;
  recipient: string;
  subject: string;
  template: string | null;
  status: EmailStatus;
  provider: string | null;
  error_message: string | null;
  metadata: string | null;
  sent_at: string;
};

export type DbApolloLead = {
  id: number;
  client_id: number | null;
  name: string;
  company: string | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  source: string;
  apollo_id: string | null;
  import_date: string;
  job_id: number | null;
  created_at: string;
};

export type DbInstantlyCampaign = {
  id: number;
  campaign_id: string;
  name: string;
  status: string;
  sent: number;
  opened: number;
  replied: number;
  positive_replies: number;
  meetings_booked: number;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
};

export type DbCrmContact = {
  id: number;
  source: string;
  external_id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  title: string | null;
  phone: string | null;
  client_id: number | null;
  deal_id: number | null;
  last_sync: string | null;
  metadata: string | null;
  created_at: string;
};

export type DbCrmDeal = {
  id: number;
  source: string;
  external_id: string;
  title: string | null;
  value: number | null;
  stage: string | null;
  status: string | null;
  contact_name: string | null;
  company: string | null;
  client_id: number | null;
  deal_id: number | null;
  last_sync: string | null;
  metadata: string | null;
  created_at: string;
};

export type DbSyncHistory = {
  id: number;
  integration_id: number | null;
  integration_name: string | null;
  operation: string;
  status: SyncStatus;
  records_processed: number;
  records_created: number;
  records_updated: number;
  error_message: string | null;
  duration_ms: number | null;
  job_id: number | null;
  started_at: string;
  completed_at: string | null;
};

// ─── Phase 9 enums ────────────────────────────────────────────────────────────

export type LeadScore = "Hot" | "Warm" | "Cold" | "Disqualified";
export type ReplyClass = "Interested" | "Meeting Requested" | "Follow Up Later" | "Not Interested" | "Wrong Contact" | "Out Of Office" | "Spam";
export type AiTaskType = "lead_scoring" | "prospect_research" | "account_research" | "campaign_analysis" | "icp_analysis" | "client_summary" | "discovery_summary" | "reply_classification";
export type ResearchType = "prospect" | "account" | "discovery";
export type InsightType = "icp_analysis" | "campaign_analysis" | "client_summary";
export type AiPromptCategory = "lead_scoring" | "research" | "analysis" | "classification";

// ─── Phase 9 table types ──────────────────────────────────────────────────────

export type DbAiJob = {
  id: number;
  job_id: number | null;
  task_type: AiTaskType;
  status: string;
  subject_id: number | null;
  subject_type: string | null;
  subject_name: string | null;
  result_id: number | null;
  result_type: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type DbAiPrompt = {
  id: number;
  name: string;
  category: AiPromptCategory;
  description: string | null;
  prompt: string;
  is_active: boolean;
  is_default: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};

export type DbLeadScore = {
  id: number;
  apollo_lead_id: number;
  score: LeadScore;
  confidence: number | null;
  reason: string | null;
  model: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  created_at: string;
};

export type DbReplyClassification = {
  id: number;
  campaign_id: string | null;
  reply_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  reply_text: string | null;
  classification: ReplyClass;
  confidence: number | null;
  reason: string | null;
  model: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  created_at: string;
};

export type DbResearchReport = {
  id: number;
  report_type: ResearchType;
  subject_name: string;
  subject_company: string | null;
  input_data: string | null;
  report_markdown: string;
  model: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  client_id: number | null;
  created_at: string;
};

export type DbAiInsight = {
  id: number;
  insight_type: InsightType;
  title: string;
  subject_id: number | null;
  subject_name: string | null;
  input_data: string | null;
  insight_markdown: string;
  model: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  client_id: number | null;
  created_at: string;
};

export type DbAiUsage = {
  id: number;
  task_type: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number | null;
  response_time_ms: number | null;
  client_id: number | null;
  created_at: string;
};

// ─── Phase 10 enums ───────────────────────────────────────────────────────────

export type SubscriptionStatus = "Trial" | "Active" | "Past Due" | "Paused" | "Cancelled" | "Expired";
export type BillingPaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded" | "Partially Refunded";
export type RefundStatus = "Pending" | "Processed" | "Failed";
export type PlanChangeType = "upgrade" | "downgrade" | "custom";
export type RenewalEventStatus = "Renewed" | "Failed" | "Skipped" | "Cancelled";
export type PlanBillingCycle = "monthly" | "annual" | "one_time";
export type PlanStatus = "Active" | "Inactive" | "Archived";

// ─── Phase 10 table types ─────────────────────────────────────────────────────

export type DbPlan = {
  id: number;
  name: string;
  slug: string;
  tier: string | null;
  description: string | null;
  price_monthly: number;
  price_annual: number | null;
  features: string[];
  billing_cycle: PlanBillingCycle;
  status: PlanStatus;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  paypal_plan_id: string | null;
  paypal_product_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbStripeCustomer = {
  id: number;
  client_id: number;
  stripe_customer_id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  updated_at: string;
};

export type DbSubscription = {
  id: number;
  client_id: number;
  client_name: string | null;
  stripe_customer_id: number | null;
  stripe_subscription_id: string | null;
  plan_id: number | null;
  plan_name: string | null;
  tier: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at: string | null;
  cancelled_at: string | null;
  mrr: number | null;
  arr: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbRefund = {
  id: number;
  payment_id: number | null;
  client_id: number | null;
  client_name: string | null;
  stripe_refund_id: string | null;
  amount: number;
  currency: string;
  reason: string | null;
  status: RefundStatus;
  processed_by: string | null;
  notes: string | null;
  created_at: string;
};

export type DbBillingEvent = {
  id: number;
  stripe_event_id: string | null;
  event_type: string;
  payload: string | null;
  processed: boolean;
  error_message: string | null;
  created_at: string;
};

export type DbPlanChange = {
  id: number;
  client_id: number;
  client_name: string | null;
  subscription_id: number | null;
  from_plan_id: number | null;
  to_plan_id: number | null;
  from_tier: string | null;
  to_tier: string | null;
  change_type: PlanChangeType;
  effective_date: string | null;
  reason: string | null;
  revenue_impact: number | null;
  created_by: string | null;
  created_at: string;
};

export type DbBillingRenewal = {
  id: number;
  client_id: number;
  client_name: string | null;
  subscription_id: number | null;
  renewal_date: string;
  status: RenewalEventStatus;
  amount: number | null;
  stripe_invoice_id: string | null;
  notes: string | null;
  created_at: string;
};

// ─── Phase 12 enums ───────────────────────────────────────────────────────────

export type TestCaseStatus = "Pass" | "Fail" | "Needs Review";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

// ─── Phase 12 table types ─────────────────────────────────────────────────────

export type DbSop = {
  id: number;
  title: string;
  category: string;
  content: string | null;
  status: string;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DbDocPage = {
  id: number;
  title: string;
  category: string;
  content: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DbTestCase = {
  id: number;
  feature: string;
  description: string | null;
  category: string | null;
  status: TestCaseStatus;
  owner: string | null;
  notes: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbSupportTicket = {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  client_id: number | null;
  client_name: string | null;
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbOffboardingRecord = {
  id: number;
  client_id: number;
  client_name: string | null;
  reason: string | null;
  offboarding_date: string | null;
  data_exported: boolean;
  access_disabled: boolean;
  archived: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type DbClientTemplate = {
  id: number;
  name: string;
  tier: string;
  description: string | null;
  default_status: string;
  features: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

// ─── Phase 11 types ───────────────────────────────────────────────────────────

export type DbAuditLog = {
  id: number;
  action: string;
  actor_id: number | null;
  actor_email: string | null;
  actor_role: string | null;
  target_type: string | null;
  target_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};

export type DbErrorLog = {
  id: number;
  error_type: string;
  message: string;
  stack: string | null;
  context: Record<string, unknown> | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
};

export type DbHealthCheckResult = {
  id: number;
  service: string;
  status: string;
  message: string | null;
  response_time_ms: number | null;
  checked_at: string;
};

// Extended payment type with Stripe fields
export type DbBillingPayment = {
  id: number;
  invoice_id: number | null;
  invoice_number: string | null;
  client_id: number | null;
  client_name: string | null;
  amount: number;
  payment_date: string;
  method: string;
  reference: string | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  currency: string;
  billing_status: string;
  created_at: string;
};

// ─── Phase 13 — Payment Providers ─────────────────────────────────────────────

export type ProviderStatus = "active" | "coming_soon" | "disabled";

export type DbPaymentProvider = {
  id: number;
  name: string;
  display_name: string;
  status: ProviderStatus;
  enabled: boolean;
  sandbox_mode: boolean;
  api_configured: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};
