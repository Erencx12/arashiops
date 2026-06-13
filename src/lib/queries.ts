import { sql } from "./db";
import type {
  DbClient, DbProject, DbAgentTask, DbApproval, DbContentItem,
  DbMeeting, DbContract, DbInvoice, DbLead, DbMrrHistory,
  DbSalesFunnel, DbActivity, DbUser, DbInviteToken, DbPasswordResetToken,
  DbOnboardingForm, DbOnboardingProgress, DbProjectMilestone,
  DbTask, DbFile, DbNotification, DbClientNote,
  DbDeal, DbDiscoveryCall, DbProposal, DbPayment, DbRenewal,
  DbIntegration, DbIntegrationCredential, DbWebhook, DbWebhookLog,
  DbJob, DbSystemLog, DbQueueItem,
  DbEmailConfig, DbEmailLog, DbApolloLead, DbInstantlyCampaign,
  DbCrmContact, DbCrmDeal, DbSyncHistory,
  DbAiJob, DbAiPrompt, DbLeadScore, DbReplyClassification,
  DbResearchReport, DbAiInsight, DbAiUsage,
  DbPlan, DbStripeCustomer, DbSubscription, DbRefund, DbBillingEvent,
  DbPlanChange, DbBillingRenewal, DbBillingPayment,
  DbAuditLog, DbErrorLog, DbHealthCheckResult,
  DbSop, DbDocPage, DbTestCase, DbSupportTicket, DbOffboardingRecord, DbClientTemplate,
  DbPaymentProvider,
} from "./db-types";

// Helper: Neon returns Record<string, any>[] — cast through unknown
function cast<T>(p: Promise<unknown>): Promise<T[]> {
  return p as Promise<T[]>;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export function getClients(): Promise<DbClient[]> {
  return cast<DbClient>(sql`
    SELECT id, company_name, contact_name, email, tier, status,
           monthly_value, industry, owner, health_score,
           to_char(renewal_date, 'Mon YYYY') AS renewal_date,
           to_char(start_date, 'Mon YYYY') AS start_date,
           created_at, COALESCE(tags, '{}') AS tags,
           contract_status, internal_notes
    FROM clients ORDER BY created_at ASC
  `);
}

export async function getClientById(id: number): Promise<DbClient | null> {
  const rows = await cast<DbClient>(sql`
    SELECT id, company_name, contact_name, email, tier, status,
           monthly_value, industry, owner, health_score,
           to_char(renewal_date, 'Mon YYYY') AS renewal_date,
           to_char(start_date, 'Mon YYYY') AS start_date,
           created_at, COALESCE(tags, '{}') AS tags,
           contract_status, internal_notes
    FROM clients WHERE id = ${id}
  `);
  return rows[0] ?? null;
}

export async function getClientByName(name: string): Promise<DbClient | null> {
  const rows = await cast<DbClient>(sql`
    SELECT id, company_name, contact_name, email, tier, status,
           monthly_value, industry, owner, health_score,
           to_char(renewal_date, 'Mon YYYY') AS renewal_date,
           to_char(start_date, 'Mon YYYY') AS start_date,
           created_at, COALESCE(tags, '{}') AS tags,
           contract_status, internal_notes
    FROM clients WHERE company_name = ${name}
  `);
  return rows[0] ?? null;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function getProjects(): Promise<DbProject[]> {
  return cast<DbProject>(sql`
    SELECT p.id, p.client_id, c.company_name AS client_name, p.title,
           p.status, p.progress, p.start_date,
           to_char(p.deadline, 'Mon DD, YYYY') AS deadline,
           p.agent, COALESCE(p.priority, 'Medium') AS priority,
           p.description, p.assigned_owner
    FROM projects p JOIN clients c ON c.id = p.client_id
    ORDER BY p.created_at ASC
  `);
}

export function getProjectsByClient(clientId: number): Promise<DbProject[]> {
  return cast<DbProject>(sql`
    SELECT p.id, p.client_id, c.company_name AS client_name, p.title,
           p.status, p.progress, p.start_date,
           to_char(p.deadline, 'Mon DD, YYYY') AS deadline,
           p.agent, COALESCE(p.priority, 'Medium') AS priority,
           p.description, p.assigned_owner
    FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE p.client_id = ${clientId}
    ORDER BY p.created_at ASC
  `);
}

export async function getProjectById(id: number): Promise<DbProject | null> {
  const rows = await cast<DbProject>(sql`
    SELECT p.id, p.client_id, c.company_name AS client_name, p.title,
           p.status, p.progress, p.start_date,
           to_char(p.deadline, 'Mon DD, YYYY') AS deadline,
           p.agent, COALESCE(p.priority, 'Medium') AS priority,
           p.description, p.assigned_owner
    FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE p.id = ${id}
  `);
  return rows[0] ?? null;
}

// ─── Agent Tasks ──────────────────────────────────────────────────────────────

export function getAgentTasks(): Promise<DbAgentTask[]> {
  return cast<DbAgentTask>(sql`
    SELECT id, agent, task, status, output,
           to_char(created_at, 'Mon DD, YYYY') AS created_at,
           to_char(completed_at, 'Mon DD, YYYY') AS completed_at,
           reviewed, approved
    FROM agent_tasks
    ORDER BY created_at DESC
  `);
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export function getApprovals(): Promise<DbApproval[]> {
  return cast<DbApproval>(sql`
    SELECT a.id, a.type, a.title, a.client_id, c.company_name AS client_name,
           a.agent, a.status, a.comment, a.client_comment, a.deliverable_id,
           to_char(a.created_at, 'Mon DD, YYYY') AS created_at
    FROM approvals a JOIN clients c ON c.id = a.client_id
    ORDER BY a.created_at DESC
  `);
}

export function getApprovalsByClient(clientId: number): Promise<DbApproval[]> {
  return cast<DbApproval>(sql`
    SELECT a.id, a.type, a.title, a.client_id, c.company_name AS client_name,
           a.agent, a.status, a.comment, a.client_comment, a.deliverable_id,
           to_char(a.created_at, 'Mon DD, YYYY') AS created_at
    FROM approvals a JOIN clients c ON c.id = a.client_id
    WHERE a.client_id = ${clientId}
    ORDER BY a.created_at DESC
  `);
}

// ─── Content Items ────────────────────────────────────────────────────────────

export function getContentItems(): Promise<DbContentItem[]> {
  return cast<DbContentItem>(sql`
    SELECT ci.id, ci.client_id, c.company_name AS client_name, ci.type,
           ci.title, ci.size_label, ci.tags, ci.status, ci.version,
           ci.project_id, to_char(ci.created_at, 'Mon DD, YYYY') AS created_at
    FROM content_items ci JOIN clients c ON c.id = ci.client_id
    ORDER BY ci.created_at DESC
  `);
}

export function getContentItemsByClient(clientId: number): Promise<DbContentItem[]> {
  return cast<DbContentItem>(sql`
    SELECT ci.id, ci.client_id, c.company_name AS client_name, ci.type,
           ci.title, ci.size_label, ci.tags, ci.status, ci.version,
           ci.project_id, to_char(ci.created_at, 'Mon DD, YYYY') AS created_at
    FROM content_items ci JOIN clients c ON c.id = ci.client_id
    WHERE ci.client_id = ${clientId}
    ORDER BY ci.created_at DESC
  `);
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export function getMeetings(): Promise<DbMeeting[]> {
  return cast<DbMeeting>(sql`
    SELECT m.id, m.client_id,
           COALESCE(c.company_name, '—') AS client_name,
           m.title, m.type,
           to_char(m.meeting_date::date, 'Mon DD, YYYY') AS meeting_date,
           m.meeting_time, m.status, m.notes, m.duration,
           COALESCE(m.video_url, NULL)  AS video_url,
           COALESCE(m.is_new, false)    AS is_new
    FROM meetings m
    LEFT JOIN clients c ON c.id = m.client_id
    ORDER BY m.meeting_date DESC
  `);
}

export async function getUpcomingMeetingsCount(): Promise<number> {
  try {
    const rows = await sql`
      SELECT COUNT(*) AS n FROM meetings
      WHERE status = 'Upcoming' AND COALESCE(is_new, true) = true
    ` as unknown as { n: string }[];
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

export async function markMeetingsSeen(): Promise<void> {
  try {
    await sql`ALTER TABLE meetings ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true`;
    await sql`UPDATE meetings SET is_new = false WHERE is_new = true`;
  } catch { /* column may not exist yet */ }
}

export async function deleteMeeting(id: number): Promise<void> {
  await sql`DELETE FROM meetings WHERE id = ${id}`;
}

export async function upsertMeetingFromCal(data: {
  calUid: string;
  title: string;
  meetingDate: string;
  meetingTime: string;
  duration: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  videoUrl?: string | null;
}): Promise<void> {
  await sql`ALTER TABLE meetings ADD COLUMN IF NOT EXISTS cal_uid   TEXT UNIQUE`;
  await sql`ALTER TABLE meetings ADD COLUMN IF NOT EXISTS video_url TEXT`;
  await sql`ALTER TABLE meetings ADD COLUMN IF NOT EXISTS is_new    BOOLEAN DEFAULT true`;
  await sql`
    INSERT INTO meetings (cal_uid, title, type, meeting_date, meeting_time, duration, status, video_url, is_new)
    VALUES (${data.calUid}, ${data.title}, 'Discovery Call',
            ${data.meetingDate}::date, ${data.meetingTime}, ${data.duration}, ${data.status},
            ${data.videoUrl ?? null}, true)
    ON CONFLICT (cal_uid) DO UPDATE SET
      title        = EXCLUDED.title,
      meeting_date = EXCLUDED.meeting_date,
      meeting_time = EXCLUDED.meeting_time,
      duration     = EXCLUDED.duration,
      status       = EXCLUDED.status,
      video_url    = EXCLUDED.video_url
  `;
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export function getContracts(): Promise<DbContract[]> {
  return cast<DbContract>(sql`
    SELECT co.id, co.client_id, c.company_name AS client_name, co.type,
           co.tier, co.status,
           to_char(co.signed_date, 'Mon DD, YYYY') AS signed_date,
           to_char(co.start_date, 'Mon DD, YYYY') AS start_date,
           to_char(co.end_date, 'Mon DD, YYYY') AS end_date,
           co.monthly_value
    FROM contracts co
    JOIN clients c ON c.id = co.client_id
    ORDER BY co.start_date DESC
  `);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export function getInvoicesByClient(clientId: number): Promise<DbInvoice[]> {
  return cast<DbInvoice>(sql`
    SELECT inv.id, inv.invoice_number, inv.client_id, c.company_name AS client_name,
           c.tier, inv.amount, inv.status,
           to_char(inv.issue_date, 'Mon DD, YYYY') AS issue_date,
           to_char(inv.due_date, 'Mon DD, YYYY') AS due_date,
           to_char(inv.paid_date, 'Mon DD, YYYY') AS paid_date
    FROM invoices inv
    JOIN clients c ON c.id = inv.client_id
    WHERE inv.client_id = ${clientId}
    ORDER BY inv.issue_date DESC
  `);
}

export function getInvoices(): Promise<DbInvoice[]> {
  return cast<DbInvoice>(sql`
    SELECT inv.id, inv.invoice_number, inv.client_id, c.company_name AS client_name,
           c.tier, inv.amount, inv.status,
           to_char(inv.issue_date, 'Mon DD, YYYY') AS issue_date,
           to_char(inv.due_date, 'Mon DD, YYYY') AS due_date,
           to_char(inv.paid_date, 'Mon DD, YYYY') AS paid_date
    FROM invoices inv
    JOIN clients c ON c.id = inv.client_id
    ORDER BY inv.issue_date DESC
  `);
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function getLeadsByClient(clientId: number): Promise<DbLead[]> {
  return cast<DbLead>(sql`
    SELECT id, client_id, name, company, email, source, status,
           estimated_value,
           to_char(created_at, 'Mon DD, YYYY') AS created_at
    FROM leads
    WHERE client_id = ${clientId}
    ORDER BY created_at DESC
  `);
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export function getMrrHistory(): Promise<DbMrrHistory[]> {
  return cast<DbMrrHistory>(sql`
    SELECT id, month_label, month_year, value
    FROM mrr_history
    ORDER BY month_year ASC
  `);
}

export function getSalesFunnel(): Promise<DbSalesFunnel[]> {
  return cast<DbSalesFunnel>(sql`
    SELECT id, stage, count, prev_count, sort_order
    FROM sales_funnel
    ORDER BY sort_order ASC
  `);
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export function getRecentActivity(limit = 8): Promise<DbActivity[]> {
  return cast<DbActivity>(sql`
    SELECT id, type, description,
           created_at::text AS created_at
    FROM activity_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await cast<DbUser>(sql`
    SELECT id, name, email, password_hash, role, client_id, status,
           created_at::text AS created_at,
           last_login::text AS last_login
    FROM users WHERE email = ${email} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<DbUser | null> {
  const rows = await cast<DbUser>(sql`
    SELECT id, name, email, password_hash, role, client_id, status,
           created_at::text AS created_at,
           last_login::text AS last_login
    FROM users WHERE id = ${id} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function getUsers(): Promise<DbUser[]> {
  return cast<DbUser>(sql`
    SELECT id, name, email, password_hash, role, client_id, status,
           created_at::text AS created_at,
           last_login::text AS last_login
    FROM users ORDER BY created_at ASC
  `);
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  role: "owner" | "client",
  clientId: number | null,
  status: "active" | "invited" = "invited"
): Promise<DbUser> {
  const rows = await cast<DbUser>(sql`
    INSERT INTO users (name, email, password_hash, role, client_id, status)
    VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${clientId}, ${status})
    RETURNING id, name, email, password_hash, role, client_id, status,
              created_at::text AS created_at,
              last_login::text AS last_login
  `);
  return rows[0];
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`;
}

export async function updateLastLogin(userId: number): Promise<void> {
  await sql`UPDATE users SET last_login = NOW() WHERE id = ${userId}`;
}

export async function updateUserStatus(userId: number, status: "active" | "invited" | "suspended"): Promise<void> {
  await sql`UPDATE users SET status = ${status} WHERE id = ${userId}`;
}

// ─── Invite Tokens ────────────────────────────────────────────────────────────

export async function createInviteToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  await sql`
    INSERT INTO invite_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;
}

export async function getInviteToken(token: string): Promise<DbInviteToken | null> {
  const rows = await cast<DbInviteToken>(sql`
    SELECT id, user_id, token, expires_at::text AS expires_at, used,
           created_at::text AS created_at
    FROM invite_tokens WHERE token = ${token} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function useInviteToken(id: number): Promise<void> {
  await sql`UPDATE invite_tokens SET used = TRUE WHERE id = ${id}`;
}

// ─── Password Reset Tokens ────────────────────────────────────────────────────

export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  // Invalidate any existing unused tokens for this user first
  await sql`UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ${userId} AND used = FALSE`;
  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;
}

export async function getPasswordResetToken(token: string): Promise<DbPasswordResetToken | null> {
  const rows = await cast<DbPasswordResetToken>(sql`
    SELECT id, user_id, token, expires_at::text AS expires_at, used,
           created_at::text AS created_at
    FROM password_reset_tokens WHERE token = ${token} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function usePasswordResetToken(id: number): Promise<void> {
  await sql`UPDATE password_reset_tokens SET used = TRUE WHERE id = ${id}`;
}

// ─── Computed metrics ─────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [clients, approvals, projects, meetings] = await Promise.all([
    sql`SELECT COUNT(*) AS total,
               SUM(monthly_value) AS mrr,
               SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active,
               ROUND(AVG(health_score)) AS avg_health
        FROM clients`,
    sql`SELECT COUNT(*) AS pending FROM approvals WHERE status = 'Pending'`,
    sql`SELECT COUNT(*) AS active FROM projects WHERE status = 'Active'`,
    sql`SELECT COUNT(*) AS upcoming FROM meetings WHERE status = 'Upcoming'`,
  ]);
  return {
    totalClients:     Number((clients as any[])[0].total),
    mrr:              Number((clients as any[])[0].mrr ?? 0),
    activeClients:    Number((clients as any[])[0].active),
    avgHealth:        Number((clients as any[])[0].avg_health ?? 0),
    pendingApprovals: Number((approvals as any[])[0].pending),
    activeProjects:   Number((projects as any[])[0].active),
    upcomingMeetings: Number((meetings as any[])[0].upcoming),
  };
}

// ─── Phase 5: Onboarding ──────────────────────────────────────────────────────

export async function getOnboardingProgress(clientId: number): Promise<DbOnboardingProgress | null> {
  const rows = await cast<DbOnboardingProgress>(sql`
    SELECT id, client_id, status, profile_setup, business_information,
           icp_information, sales_information, requirements_submitted,
           kickoff_scheduled,
           completed_at::text AS completed_at,
           created_at::text AS created_at
    FROM onboarding_progress WHERE client_id = ${clientId}
  `);
  return rows[0] ?? null;
}

export async function upsertOnboardingProgress(clientId: number): Promise<DbOnboardingProgress> {
  const rows = await cast<DbOnboardingProgress>(sql`
    INSERT INTO onboarding_progress (client_id) VALUES (${clientId})
    ON CONFLICT (client_id) DO UPDATE SET client_id = EXCLUDED.client_id
    RETURNING id, client_id, status, profile_setup, business_information,
              icp_information, sales_information, requirements_submitted,
              kickoff_scheduled,
              completed_at::text AS completed_at,
              created_at::text AS created_at
  `);
  return rows[0];
}

export async function updateOnboardingStep(
  clientId: number,
  step: "profile_setup" | "business_information" | "icp_information" | "sales_information" | "requirements_submitted" | "kickoff_scheduled",
  value: boolean
): Promise<void> {
  // Dynamic column update via safe mapping
  const colMap = {
    profile_setup: sql`profile_setup`,
    business_information: sql`business_information`,
    icp_information: sql`icp_information`,
    sales_information: sql`sales_information`,
    requirements_submitted: sql`requirements_submitted`,
    kickoff_scheduled: sql`kickoff_scheduled`,
  };
  const col = colMap[step];
  await sql`UPDATE onboarding_progress SET ${col} = ${value} WHERE client_id = ${clientId}`;
}

export async function updateOnboardingStatus(clientId: number, status: string): Promise<void> {
  const completedAt = status === "Completed" ? sql`NOW()` : sql`NULL`;
  await sql`
    UPDATE onboarding_progress
    SET status = ${status}, completed_at = ${completedAt}
    WHERE client_id = ${clientId}
  `;
}

export async function getOnboardingForm(clientId: number): Promise<DbOnboardingForm | null> {
  const rows = await cast<DbOnboardingForm>(sql`
    SELECT id, client_id, company_name, industry, website, target_market,
           ideal_customer_profile, average_deal_size, current_crm,
           sales_team_size, current_outreach_process, business_goals,
           monthly_revenue_range, primary_challenges, additional_notes,
           submitted_at::text AS submitted_at,
           created_at::text AS created_at
    FROM onboarding_forms WHERE client_id = ${clientId}
    ORDER BY created_at DESC LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function upsertOnboardingForm(
  clientId: number,
  data: Partial<Omit<DbOnboardingForm, "id" | "client_id" | "created_at">>
): Promise<void> {
  await sql`
    INSERT INTO onboarding_forms (
      client_id, company_name, industry, website, target_market,
      ideal_customer_profile, average_deal_size, current_crm,
      sales_team_size, current_outreach_process, business_goals,
      monthly_revenue_range, primary_challenges, additional_notes, submitted_at
    ) VALUES (
      ${clientId},
      ${data.company_name ?? null}, ${data.industry ?? null}, ${data.website ?? null},
      ${data.target_market ?? null}, ${data.ideal_customer_profile ?? null},
      ${data.average_deal_size ?? null}, ${data.current_crm ?? null},
      ${data.sales_team_size ?? null}, ${data.current_outreach_process ?? null},
      ${data.business_goals ?? null}, ${data.monthly_revenue_range ?? null},
      ${data.primary_challenges ?? null}, ${data.additional_notes ?? null},
      ${data.submitted_at ?? null}
    )
    ON CONFLICT DO NOTHING
  `;
}

// ─── Phase 5: Project Milestones ──────────────────────────────────────────────

export function getMilestonesByProject(projectId: number): Promise<DbProjectMilestone[]> {
  return cast<DbProjectMilestone>(sql`
    SELECT id, project_id, title, description,
           to_char(due_date, 'Mon DD, YYYY') AS due_date,
           status,
           completed_at::text AS completed_at,
           created_at::text AS created_at
    FROM project_milestones
    WHERE project_id = ${projectId}
    ORDER BY created_at ASC
  `);
}

export async function createMilestone(
  projectId: number, title: string, description: string | null, dueDate: string | null
): Promise<DbProjectMilestone> {
  const rows = await cast<DbProjectMilestone>(sql`
    INSERT INTO project_milestones (project_id, title, description, due_date)
    VALUES (${projectId}, ${title}, ${description}, ${dueDate ?? null})
    RETURNING id, project_id, title, description,
              to_char(due_date, 'Mon DD, YYYY') AS due_date,
              status, completed_at::text AS completed_at, created_at::text AS created_at
  `);
  return rows[0];
}

export async function updateMilestoneStatus(id: number, status: string): Promise<void> {
  const completedAt = status === "Completed" ? sql`NOW()` : sql`NULL`;
  await sql`UPDATE project_milestones SET status = ${status}, completed_at = ${completedAt} WHERE id = ${id}`;
}

// ─── Phase 5: Tasks ───────────────────────────────────────────────────────────


export function getTasks(): Promise<DbTask[]> {
  return cast<DbTask>(sql`
    SELECT t.id, t.title, t.description, t.priority, t.status, t.assignee,
           t.client_id, c.company_name AS client_name,
           t.project_id, p.title AS project_title,
           to_char(t.due_date, 'Mon DD, YYYY') AS due_date,
           to_char(t.created_at, 'Mon DD, YYYY') AS created_at,
           completed_at::text AS completed_at
    FROM tasks t
    LEFT JOIN clients c ON c.id = t.client_id
    LEFT JOIN projects p ON p.id = t.project_id
    ORDER BY
      CASE t.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
      t.created_at DESC
  `);
}

export function getTasksByClient(clientId: number): Promise<DbTask[]> {
  return cast<DbTask>(sql`
    SELECT t.id, t.title, t.description, t.priority, t.status, t.assignee,
           t.client_id, c.company_name AS client_name,
           t.project_id, p.title AS project_title,
           to_char(t.due_date, 'Mon DD, YYYY') AS due_date,
           to_char(t.created_at, 'Mon DD, YYYY') AS created_at,
           completed_at::text AS completed_at
    FROM tasks t
    LEFT JOIN clients c ON c.id = t.client_id
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE t.client_id = ${clientId}
    ORDER BY t.created_at DESC
  `);
}

export function getTasksByProject(projectId: number): Promise<DbTask[]> {
  return cast<DbTask>(sql`
    SELECT t.id, t.title, t.description, t.priority, t.status, t.assignee,
           t.client_id, c.company_name AS client_name,
           t.project_id, p.title AS project_title,
           to_char(t.due_date, 'Mon DD, YYYY') AS due_date,
           to_char(t.created_at, 'Mon DD, YYYY') AS created_at,
           completed_at::text AS completed_at
    FROM tasks t
    LEFT JOIN clients c ON c.id = t.client_id
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE t.project_id = ${projectId}
    ORDER BY t.created_at DESC
  `);
}

export async function createTask(data: {
  title: string; description?: string | null; priority: string; assignee?: string | null;
  clientId?: number | null; projectId?: number | null; dueDate?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO tasks (title, description, priority, assignee, client_id, project_id, due_date)
    VALUES (${data.title}, ${data.description ?? null}, ${data.priority},
            ${data.assignee ?? null}, ${data.clientId ?? null},
            ${data.projectId ?? null}, ${data.dueDate ?? null})
  `;
}

export async function updateTaskStatus(id: number, status: string): Promise<void> {
  const completedAt = status === "Completed" ? sql`NOW()` : sql`NULL`;
  await sql`UPDATE tasks SET status = ${status}, completed_at = ${completedAt} WHERE id = ${id}`;
}

// ─── Phase 5: Files ───────────────────────────────────────────────────────────

export function getFiles(): Promise<DbFile[]> {
  return cast<DbFile>(sql`
    SELECT f.id, f.name, f.file_type, f.size_label, f.url,
           f.client_id, c.company_name AS client_name,
           f.project_id, f.uploaded_by, f.version,
           to_char(f.created_at, 'Mon DD, YYYY') AS created_at
    FROM files f
    LEFT JOIN clients c ON c.id = f.client_id
    ORDER BY f.created_at DESC
  `);
}

export function getFilesByClient(clientId: number): Promise<DbFile[]> {
  return cast<DbFile>(sql`
    SELECT f.id, f.name, f.file_type, f.size_label, f.url,
           f.client_id, c.company_name AS client_name,
           f.project_id, f.uploaded_by, f.version,
           to_char(f.created_at, 'Mon DD, YYYY') AS created_at
    FROM files f
    LEFT JOIN clients c ON c.id = f.client_id
    WHERE f.client_id = ${clientId}
    ORDER BY f.created_at DESC
  `);
}

export async function createFile(data: {
  name: string; fileType: string; sizeLabel: string; clientId?: number | null;
  projectId?: number | null; uploadedBy: string; version: string;
}): Promise<void> {
  await sql`
    INSERT INTO files (name, file_type, size_label, client_id, project_id, uploaded_by, version)
    VALUES (${data.name}, ${data.fileType}, ${data.sizeLabel},
            ${data.clientId ?? null}, ${data.projectId ?? null},
            ${data.uploadedBy}, ${data.version})
  `;
}

// ─── Phase 5: Notifications ───────────────────────────────────────────────────

export function getNotifications(limit = 20): Promise<DbNotification[]> {
  return cast<DbNotification>(sql`
    SELECT id, type, title, message, client_id, read,
           created_at::text AS created_at
    FROM notifications
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const rows = await sql`SELECT COUNT(*) AS cnt FROM notifications WHERE read = FALSE` as any[];
  return Number(rows[0].cnt);
}

export async function markNotificationRead(id: number): Promise<void> {
  await sql`UPDATE notifications SET read = TRUE WHERE id = ${id}`;
}

export async function markAllNotificationsRead(): Promise<void> {
  await sql`UPDATE notifications SET read = TRUE WHERE read = FALSE`;
}

export async function createNotification(data: {
  type: string; title: string; message: string; clientId?: number | null;
}): Promise<void> {
  await sql`
    INSERT INTO notifications (type, title, message, client_id)
    VALUES (${data.type}, ${data.title}, ${data.message}, ${data.clientId ?? null})
  `;
}

// ─── Phase 5: Client Notes ────────────────────────────────────────────────────

export function getNotesByClient(clientId: number): Promise<DbClientNote[]> {
  return cast<DbClientNote>(sql`
    SELECT id, client_id, content, is_internal, created_by,
           created_at::text AS created_at
    FROM client_notes
    WHERE client_id = ${clientId}
    ORDER BY created_at DESC
  `);
}

export async function createClientNote(
  clientId: number, content: string, isInternal: boolean, createdBy: string
): Promise<DbClientNote> {
  const rows = await cast<DbClientNote>(sql`
    INSERT INTO client_notes (client_id, content, is_internal, created_by)
    VALUES (${clientId}, ${content}, ${isInternal}, ${createdBy})
    RETURNING id, client_id, content, is_internal, created_by,
              created_at::text AS created_at
  `);
  return rows[0];
}

export async function deleteClientNote(id: number): Promise<void> {
  await sql`DELETE FROM client_notes WHERE id = ${id}`;
}

// ─── Phase 5: Project creation ────────────────────────────────────────────────

export async function createProject(data: {
  clientId: number; title: string; status: string; priority: string;
  deadline: string; agent: string; description?: string | null; assignedOwner?: string | null;
}): Promise<DbProject> {
  const rows = await cast<{ id: number }>(sql`
    INSERT INTO projects (client_id, title, status, priority, deadline, agent, description, assigned_owner, progress)
    VALUES (${data.clientId}, ${data.title}, ${data.status}, ${data.priority},
            ${data.deadline}, ${data.agent}, ${data.description ?? null},
            ${data.assignedOwner ?? 'Soham Das'}, 0)
    RETURNING id
  `);
  const created = await getProjectById(rows[0].id);
  return created!;
}

export async function updateProjectFields(id: number, data: {
  status?: string; progress?: number; priority?: string; description?: string | null;
}): Promise<void> {
  if (data.status !== undefined) await sql`UPDATE projects SET status = ${data.status} WHERE id = ${id}`;
  if (data.progress !== undefined) await sql`UPDATE projects SET progress = ${data.progress} WHERE id = ${id}`;
  if (data.priority !== undefined) await sql`UPDATE projects SET priority = ${data.priority} WHERE id = ${id}`;
  if (data.description !== undefined) await sql`UPDATE projects SET description = ${data.description} WHERE id = ${id}`;
}

// ─── Phase 5: Client management ───────────────────────────────────────────────

export async function updateClientTier(clientId: number, tier: string): Promise<void> {
  await sql`UPDATE clients SET tier = ${tier} WHERE id = ${clientId}`;
}

export async function updateClientStatus(clientId: number, status: string): Promise<void> {
  await sql`UPDATE clients SET status = ${status} WHERE id = ${clientId}`;
}

export async function updateClientHealthScore(clientId: number, score: number): Promise<void> {
  await sql`UPDATE clients SET health_score = ${score} WHERE id = ${clientId}`;
}

export async function updateClientInfo(clientId: number, data: {
  contact_name?: string; email?: string; monthly_value?: number;
  industry?: string; internal_notes?: string; contract_status?: string;
}): Promise<void> {
  const updates: Promise<unknown>[] = [];
  if (data.contact_name !== undefined)  updates.push(sql`UPDATE clients SET contact_name = ${data.contact_name} WHERE id = ${clientId}`);
  if (data.email !== undefined)         updates.push(sql`UPDATE clients SET email = ${data.email} WHERE id = ${clientId}`);
  if (data.monthly_value !== undefined) updates.push(sql`UPDATE clients SET monthly_value = ${data.monthly_value} WHERE id = ${clientId}`);
  if (data.industry !== undefined)      updates.push(sql`UPDATE clients SET industry = ${data.industry} WHERE id = ${clientId}`);
  if (data.internal_notes !== undefined) updates.push(sql`UPDATE clients SET internal_notes = ${data.internal_notes} WHERE id = ${clientId}`);
  if (data.contract_status !== undefined) updates.push(sql`UPDATE clients SET contract_status = ${data.contract_status} WHERE id = ${clientId}`);
  await Promise.all(updates);
}

// ─── Phase 6: Deals ───────────────────────────────────────────────────────────

export function getDeals(): Promise<DbDeal[]> {
  return cast<DbDeal>(sql`
    SELECT id, company, contact_name, contact_email,
           deal_value::float AS deal_value,
           stage, owner,
           to_char(expected_close_date, 'Mon DD, YYYY') AS expected_close_date,
           notes, client_id,
           created_at::text AS created_at,
           updated_at::text AS updated_at
    FROM deals ORDER BY created_at DESC
  `);
}

export async function getDealById(id: number): Promise<DbDeal | null> {
  const rows = await cast<DbDeal>(sql`
    SELECT id, company, contact_name, contact_email,
           deal_value::float AS deal_value,
           stage, owner,
           to_char(expected_close_date, 'Mon DD, YYYY') AS expected_close_date,
           notes, client_id,
           created_at::text AS created_at,
           updated_at::text AS updated_at
    FROM deals WHERE id = ${id}
  `);
  return rows[0] ?? null;
}

export async function createDeal(data: {
  company: string; contactName: string; contactEmail?: string | null;
  dealValue: number; stage: string; owner: string;
  expectedCloseDate?: string | null; notes?: string | null;
}): Promise<DbDeal> {
  const rows = await cast<{ id: number }>(sql`
    INSERT INTO deals (company, contact_name, contact_email, deal_value, stage, owner, expected_close_date, notes)
    VALUES (${data.company}, ${data.contactName}, ${data.contactEmail ?? null},
            ${data.dealValue}, ${data.stage}, ${data.owner},
            ${data.expectedCloseDate ?? null}, ${data.notes ?? null})
    RETURNING id
  `);
  return (await getDealById(rows[0].id))!;
}

export async function updateDealStage(id: number, stage: string): Promise<void> {
  await sql`UPDATE deals SET stage = ${stage}, updated_at = NOW() WHERE id = ${id}`;
}

export async function updateDealFields(id: number, data: {
  company?: string; contactName?: string; contactEmail?: string | null;
  dealValue?: number; owner?: string; expectedCloseDate?: string | null;
  notes?: string | null; clientId?: number | null;
}): Promise<void> {
  const ops: Promise<unknown>[] = [];
  if (data.company !== undefined)           ops.push(sql`UPDATE deals SET company = ${data.company}, updated_at = NOW() WHERE id = ${id}`);
  if (data.contactName !== undefined)       ops.push(sql`UPDATE deals SET contact_name = ${data.contactName} WHERE id = ${id}`);
  if (data.contactEmail !== undefined)      ops.push(sql`UPDATE deals SET contact_email = ${data.contactEmail} WHERE id = ${id}`);
  if (data.dealValue !== undefined)         ops.push(sql`UPDATE deals SET deal_value = ${data.dealValue} WHERE id = ${id}`);
  if (data.owner !== undefined)             ops.push(sql`UPDATE deals SET owner = ${data.owner} WHERE id = ${id}`);
  if (data.expectedCloseDate !== undefined) ops.push(sql`UPDATE deals SET expected_close_date = ${data.expectedCloseDate} WHERE id = ${id}`);
  if (data.notes !== undefined)             ops.push(sql`UPDATE deals SET notes = ${data.notes} WHERE id = ${id}`);
  if (data.clientId !== undefined)          ops.push(sql`UPDATE deals SET client_id = ${data.clientId} WHERE id = ${id}`);
  await Promise.all(ops);
}

// ─── Phase 6: Discovery Calls ─────────────────────────────────────────────────

export function getDiscoveryCalls(): Promise<DbDiscoveryCall[]> {
  return cast<DbDiscoveryCall>(sql`
    SELECT dc.id, dc.deal_id, d.company AS deal_company,
           dc.company, dc.contact_name,
           to_char(dc.call_date, 'Mon DD, YYYY') AS call_date,
           dc.meeting_notes, dc.pain_points, dc.requirements,
           dc.budget, dc.decision_timeline, dc.next_action,
           dc.created_at::text AS created_at
    FROM discovery_calls dc
    LEFT JOIN deals d ON d.id = dc.deal_id
    ORDER BY dc.created_at DESC
  `);
}

export async function getDiscoveryCallById(id: number): Promise<DbDiscoveryCall | null> {
  const rows = await cast<DbDiscoveryCall>(sql`
    SELECT dc.id, dc.deal_id, d.company AS deal_company,
           dc.company, dc.contact_name,
           to_char(dc.call_date, 'Mon DD, YYYY') AS call_date,
           dc.meeting_notes, dc.pain_points, dc.requirements,
           dc.budget, dc.decision_timeline, dc.next_action,
           dc.created_at::text AS created_at
    FROM discovery_calls dc
    LEFT JOIN deals d ON d.id = dc.deal_id
    WHERE dc.id = ${id}
  `);
  return rows[0] ?? null;
}

export function getDiscoveryCallsByDeal(dealId: number): Promise<DbDiscoveryCall[]> {
  return cast<DbDiscoveryCall>(sql`
    SELECT dc.id, dc.deal_id, d.company AS deal_company,
           dc.company, dc.contact_name,
           to_char(dc.call_date, 'Mon DD, YYYY') AS call_date,
           dc.meeting_notes, dc.pain_points, dc.requirements,
           dc.budget, dc.decision_timeline, dc.next_action,
           dc.created_at::text AS created_at
    FROM discovery_calls dc
    LEFT JOIN deals d ON d.id = dc.deal_id
    WHERE dc.deal_id = ${dealId}
    ORDER BY dc.created_at DESC
  `);
}

export async function createDiscoveryCall(data: {
  dealId?: number | null; company: string; contactName: string;
  callDate?: string | null; meetingNotes?: string | null; painPoints?: string | null;
  requirements?: string | null; budget?: string | null;
  decisionTimeline?: string | null; nextAction?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO discovery_calls
      (deal_id, company, contact_name, call_date, meeting_notes, pain_points,
       requirements, budget, decision_timeline, next_action)
    VALUES
      (${data.dealId ?? null}, ${data.company}, ${data.contactName},
       ${data.callDate ?? null}, ${data.meetingNotes ?? null}, ${data.painPoints ?? null},
       ${data.requirements ?? null}, ${data.budget ?? null},
       ${data.decisionTimeline ?? null}, ${data.nextAction ?? null})
  `;
}

// ─── Phase 6: Proposals ───────────────────────────────────────────────────────

export function getProposals(): Promise<DbProposal[]> {
  return cast<DbProposal>(sql`
    SELECT p.id, p.deal_id, d.company AS deal_company,
           p.client_id, c.company_name AS client_name,
           p.title, p.status, p.package,
           p.monthly_value::float AS monthly_value,
           p.setup_fee::float AS setup_fee,
           p.deliverables, p.terms, p.timeline, p.notes, p.version,
           p.sent_at::text AS sent_at, p.accepted_at::text AS accepted_at,
           to_char(p.expires_at, 'Mon DD, YYYY') AS expires_at,
           p.created_at::text AS created_at, p.updated_at::text AS updated_at
    FROM proposals p
    LEFT JOIN deals d ON d.id = p.deal_id
    LEFT JOIN clients c ON c.id = p.client_id
    ORDER BY p.created_at DESC
  `);
}

export async function getProposalById(id: number): Promise<DbProposal | null> {
  const rows = await cast<DbProposal>(sql`
    SELECT p.id, p.deal_id, d.company AS deal_company,
           p.client_id, c.company_name AS client_name,
           p.title, p.status, p.package,
           p.monthly_value::float AS monthly_value,
           p.setup_fee::float AS setup_fee,
           p.deliverables, p.terms, p.timeline, p.notes, p.version,
           p.sent_at::text AS sent_at, p.accepted_at::text AS accepted_at,
           to_char(p.expires_at, 'Mon DD, YYYY') AS expires_at,
           p.created_at::text AS created_at, p.updated_at::text AS updated_at
    FROM proposals p
    LEFT JOIN deals d ON d.id = p.deal_id
    LEFT JOIN clients c ON c.id = p.client_id
    WHERE p.id = ${id}
  `);
  return rows[0] ?? null;
}

export function getProposalsByDeal(dealId: number): Promise<DbProposal[]> {
  return cast<DbProposal>(sql`
    SELECT p.id, p.deal_id, d.company AS deal_company,
           p.client_id, c.company_name AS client_name,
           p.title, p.status, p.package,
           p.monthly_value::float AS monthly_value,
           p.setup_fee::float AS setup_fee,
           p.deliverables, p.terms, p.timeline, p.notes, p.version,
           p.sent_at::text AS sent_at, p.accepted_at::text AS accepted_at,
           to_char(p.expires_at, 'Mon DD, YYYY') AS expires_at,
           p.created_at::text AS created_at, p.updated_at::text AS updated_at
    FROM proposals p
    LEFT JOIN deals d ON d.id = p.deal_id
    LEFT JOIN clients c ON c.id = p.client_id
    WHERE p.deal_id = ${dealId}
    ORDER BY p.created_at DESC
  `);
}

export async function createProposal(data: {
  dealId?: number | null; clientId?: number | null; title: string;
  package: string; monthlyValue: number; setupFee: number;
  deliverables?: string | null; terms?: string | null;
  timeline?: string | null; notes?: string | null; expiresAt?: string | null;
}): Promise<DbProposal> {
  const rows = await cast<{ id: number }>(sql`
    INSERT INTO proposals
      (deal_id, client_id, title, package, monthly_value, setup_fee,
       deliverables, terms, timeline, notes, expires_at)
    VALUES
      (${data.dealId ?? null}, ${data.clientId ?? null}, ${data.title},
       ${data.package}, ${data.monthlyValue}, ${data.setupFee},
       ${data.deliverables ?? null}, ${data.terms ?? null},
       ${data.timeline ?? null}, ${data.notes ?? null},
       ${data.expiresAt ?? null})
    RETURNING id
  `);
  return (await getProposalById(rows[0].id))!;
}

export async function updateProposalStatus(id: number, status: string): Promise<void> {
  const now = new Date().toISOString();
  if (status === "Sent")     await sql`UPDATE proposals SET status = ${status}, sent_at = ${now}, updated_at = NOW() WHERE id = ${id}`;
  else if (status === "Accepted") await sql`UPDATE proposals SET status = ${status}, accepted_at = ${now}, updated_at = NOW() WHERE id = ${id}`;
  else                       await sql`UPDATE proposals SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Phase 6: Contracts (enhanced) ────────────────────────────────────────────

export function getContractsEnhanced(): Promise<DbContract[]> {
  return cast<DbContract>(sql`
    SELECT co.id, co.client_id, c.company_name AS client_name, co.type,
           co.tier, co.status,
           to_char(co.signed_date, 'Mon DD, YYYY') AS signed_date,
           to_char(co.start_date, 'Mon DD, YYYY') AS start_date,
           to_char(co.end_date, 'Mon DD, YYYY') AS end_date,
           co.monthly_value,
           COALESCE(co.deal_id, NULL) AS deal_id,
           COALESCE(co.proposal_id, NULL) AS proposal_id,
           co.contract_number
    FROM contracts co
    JOIN clients c ON c.id = co.client_id
    ORDER BY co.start_date DESC
  `);
}

export async function createContract(data: {
  clientId: number; type: string; tier: string; status: string;
  startDate: string; endDate: string; monthlyValue: number;
  dealId?: number | null; proposalId?: number | null;
  contractNumber?: string | null; signedDate?: string | null;
}): Promise<void> {
  const num = data.contractNumber ?? `CTR-${Date.now().toString().slice(-6)}`;
  await sql`
    INSERT INTO contracts
      (client_id, type, tier, status, start_date, end_date, monthly_value,
       deal_id, proposal_id, contract_number, signed_date)
    VALUES
      (${data.clientId}, ${data.type}, ${data.tier}, ${data.status},
       ${data.startDate}, ${data.endDate}, ${data.monthlyValue},
       ${data.dealId ?? null}, ${data.proposalId ?? null},
       ${num}, ${data.signedDate ?? null})
  `;
}

export async function updateContractStatus(id: number, status: string): Promise<void> {
  const signedDate = status === "Signed" ? sql`CURRENT_DATE` : sql`signed_date`;
  await sql`UPDATE contracts SET status = ${status}, signed_date = ${signedDate} WHERE id = ${id}`;
}

// ─── Phase 6: Invoices (enhanced) ─────────────────────────────────────────────

export function getInvoicesEnhanced(): Promise<DbInvoice[]> {
  return cast<DbInvoice>(sql`
    SELECT inv.id, inv.invoice_number, inv.client_id, c.company_name AS client_name,
           c.tier, inv.amount, inv.status,
           to_char(inv.issue_date, 'Mon DD, YYYY') AS issue_date,
           to_char(inv.due_date, 'Mon DD, YYYY') AS due_date,
           to_char(inv.paid_date, 'Mon DD, YYYY') AS paid_date,
           inv.description,
           COALESCE(inv.deal_id, NULL) AS deal_id,
           COALESCE(inv.proposal_id, NULL) AS proposal_id
    FROM invoices inv
    JOIN clients c ON c.id = inv.client_id
    ORDER BY inv.issue_date DESC
  `);
}

export async function getInvoiceById(id: number): Promise<(DbInvoice & { contact_name: string; client_email: string }) | null> {
  const rows = await cast<DbInvoice & { contact_name: string; client_email: string }>(sql`
    SELECT inv.id, inv.invoice_number, inv.client_id, c.company_name AS client_name,
           c.tier, inv.amount, inv.status,
           to_char(inv.issue_date, 'Mon DD, YYYY') AS issue_date,
           to_char(inv.due_date, 'Mon DD, YYYY') AS due_date,
           to_char(inv.paid_date, 'Mon DD, YYYY') AS paid_date,
           inv.description,
           COALESCE(inv.deal_id, NULL) AS deal_id,
           COALESCE(inv.proposal_id, NULL) AS proposal_id,
           c.contact_name, c.email AS client_email
    FROM invoices inv
    JOIN clients c ON c.id = inv.client_id
    WHERE inv.id = ${id}
    LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function createInvoice(data: {
  clientId: number; amount: number; status: string;
  issueDate: string; dueDate: string; description?: string | null;
  dealId?: number | null; proposalId?: number | null;
}): Promise<{ id: number; invoice_number: string }> {
  const num = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const rows = await cast<{ id: number; invoice_number: string }>(sql`
    INSERT INTO invoices
      (invoice_number, client_id, amount, status, issue_date, due_date,
       description, deal_id, proposal_id)
    VALUES
      (${num}, ${data.clientId}, ${data.amount}, ${data.status},
       ${data.issueDate}, ${data.dueDate}, ${data.description ?? null},
       ${data.dealId ?? null}, ${data.proposalId ?? null})
    RETURNING id, invoice_number
  `);
  return rows[0];
}

export async function updateInvoiceStatus(id: number, status: string): Promise<void> {
  const paidDate = status === "Paid" ? sql`CURRENT_DATE` : sql`paid_date`;
  await sql`UPDATE invoices SET status = ${status}, paid_date = ${paidDate} WHERE id = ${id}`;
}

// ─── Phase 6: Payments ────────────────────────────────────────────────────────

export function getPayments(): Promise<DbPayment[]> {
  return cast<DbPayment>(sql`
    SELECT p.id, p.invoice_id, inv.invoice_number,
           p.client_id, c.company_name AS client_name,
           p.amount::float AS amount,
           to_char(p.payment_date, 'Mon DD, YYYY') AS payment_date,
           p.method, p.reference, p.notes,
           p.created_at::text AS created_at
    FROM payments p
    LEFT JOIN invoices inv ON inv.id = p.invoice_id
    LEFT JOIN clients c ON c.id = p.client_id
    ORDER BY p.payment_date DESC
  `);
}

export async function logPayment(data: {
  invoiceId?: number | null; clientId?: number | null; amount: number;
  paymentDate: string; method: string; reference?: string | null; notes?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO payments (invoice_id, client_id, amount, payment_date, method, reference, notes)
    VALUES (${data.invoiceId ?? null}, ${data.clientId ?? null}, ${data.amount},
            ${data.paymentDate}, ${data.method}, ${data.reference ?? null}, ${data.notes ?? null})
  `;
}

// ─── Phase 6: Renewals ────────────────────────────────────────────────────────

export function getRenewals(): Promise<DbRenewal[]> {
  return cast<DbRenewal>(sql`
    SELECT r.id, r.client_id, c.company_name AS client_name,
           r.contract_id,
           to_char(r.renewal_date, 'Mon DD, YYYY') AS renewal_date,
           r.status,
           r.monthly_value::float AS monthly_value,
           r.notes,
           r.created_at::text AS created_at
    FROM renewals r
    JOIN clients c ON c.id = r.client_id
    ORDER BY r.renewal_date ASC NULLS LAST
  `);
}

export async function upsertRenewal(clientId: number, data: {
  contractId?: number | null; renewalDate?: string | null;
  status?: string; monthlyValue?: number | null;
}): Promise<void> {
  await sql`
    INSERT INTO renewals (client_id, contract_id, renewal_date, status, monthly_value)
    VALUES (${clientId}, ${data.contractId ?? null}, ${data.renewalDate ?? null},
            ${data.status ?? 'Upcoming'}, ${data.monthlyValue ?? null})
    ON CONFLICT DO NOTHING
  `;
}

export async function updateRenewalStatus(id: number, status: string): Promise<void> {
  await sql`UPDATE renewals SET status = ${status} WHERE id = ${id}`;
}

// ─── Phase 6: Financial metrics ───────────────────────────────────────────────

export async function getFinancialMetrics() {
  const [revenue, outstanding, payments] = await Promise.all([
    sql`SELECT
          SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) AS paid,
          SUM(CASE WHEN status IN ('Sent','Partially Paid') THEN amount ELSE 0 END) AS outstanding,
          SUM(CASE WHEN status = 'Overdue' THEN amount ELSE 0 END) AS overdue,
          COUNT(*) AS total_invoices
        FROM invoices` as Promise<any[]>,
    sql`SELECT SUM(monthly_value) AS mrr FROM clients WHERE status = 'Active'` as Promise<any[]>,
    sql`SELECT SUM(amount) AS total_paid FROM payments` as Promise<any[]>,
  ]);
  const r = (revenue as any[])[0];
  const o = (outstanding as any[])[0];
  const p = (payments as any[])[0];
  return {
    paid:           Number(r.paid ?? 0),
    outstanding:    Number(r.outstanding ?? 0),
    overdue:        Number(r.overdue ?? 0),
    totalInvoices:  Number(r.total_invoices ?? 0),
    mrr:            Number(o.mrr ?? 0),
    totalPayments:  Number(p.total_paid ?? 0),
  };
}

// ─── Phase 7: Integrations ────────────────────────────────────────────────────

export function getIntegrations(): Promise<DbIntegration[]> {
  return cast<DbIntegration>(sql`
    SELECT id, name, slug, COALESCE(category, 'other') AS category,
           status, enabled, health_score,
           last_sync::text AS last_sync, last_error,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM integrations ORDER BY name ASC
  `);
}

export async function toggleIntegration(id: number, enabled: boolean): Promise<void> {
  const status = enabled ? "Connected" : "Disconnected";
  await sql`UPDATE integrations SET enabled = ${enabled}, status = ${status}, updated_at = NOW() WHERE id = ${id}`;
}

export async function updateIntegrationHealth(id: number, data: {
  status: string; lastSync?: string; lastError?: string | null; healthScore?: number;
}): Promise<void> {
  await sql`
    UPDATE integrations SET
      status       = ${data.status},
      last_sync    = ${data.lastSync ?? null},
      last_error   = ${data.lastError ?? null},
      health_score = ${data.healthScore ?? 0},
      updated_at   = NOW()
    WHERE id = ${id}
  `;
}

// ─── Phase 7: Integration Credentials ────────────────────────────────────────

export function getCredentials(integrationId?: number): Promise<DbIntegrationCredential[]> {
  if (integrationId) {
    return cast<DbIntegrationCredential>(sql`
      SELECT ic.id, ic.integration_id, i.name AS integration_name,
             ic.service, ic.key_label, ic.key_masked, ic.status,
             ic.created_at::text AS created_at, ic.updated_at::text AS updated_at
      FROM integration_credentials ic
      LEFT JOIN integrations i ON i.id = ic.integration_id
      WHERE ic.integration_id = ${integrationId}
      ORDER BY ic.created_at DESC
    `);
  }
  return cast<DbIntegrationCredential>(sql`
    SELECT ic.id, ic.integration_id, i.name AS integration_name,
           ic.service, ic.key_label, ic.key_masked, ic.status,
           ic.created_at::text AS created_at, ic.updated_at::text AS updated_at
    FROM integration_credentials ic
    LEFT JOIN integrations i ON i.id = ic.integration_id
    ORDER BY ic.created_at DESC
  `);
}

export async function addCredential(data: {
  integrationId?: number | null; service: string; keyLabel: string; keyMasked: string;
}): Promise<void> {
  await sql`
    INSERT INTO integration_credentials (integration_id, service, key_label, key_masked)
    VALUES (${data.integrationId ?? null}, ${data.service}, ${data.keyLabel}, ${data.keyMasked})
  `;
}

export async function deleteCredential(id: number): Promise<void> {
  await sql`DELETE FROM integration_credentials WHERE id = ${id}`;
}

export async function updateCredentialStatus(id: number, status: string): Promise<void> {
  await sql`UPDATE integration_credentials SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Phase 7: Webhooks ────────────────────────────────────────────────────────

export function getWebhooks(): Promise<DbWebhook[]> {
  return cast<DbWebhook>(sql`
    SELECT id, name, source, endpoint, status, secret,
           last_trigger::text AS last_trigger, trigger_count,
           created_at::text AS created_at
    FROM webhooks ORDER BY created_at DESC
  `);
}

export async function createWebhook(data: {
  name: string; source: string; endpoint: string; secret?: string | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO webhooks (name, source, endpoint, secret)
    VALUES (${data.name}, ${data.source}, ${data.endpoint}, ${data.secret ?? null})
    RETURNING id
  `;
  return (rows as unknown as { id: number }[])[0];
}

export async function updateWebhookStatus(id: number, status: string): Promise<void> {
  await sql`UPDATE webhooks SET status = ${status} WHERE id = ${id}`;
}

export async function deleteWebhook(id: number): Promise<void> {
  await sql`DELETE FROM webhooks WHERE id = ${id}`;
}

export async function recordWebhookTrigger(id: number, success: boolean, payloadSize: number, responseStatus?: number | null, errorMessage?: string | null): Promise<void> {
  await sql`UPDATE webhooks SET trigger_count = trigger_count + 1, last_trigger = NOW() WHERE id = ${id}`;
  await sql`
    INSERT INTO webhook_logs (webhook_id, payload_size, response_status, success, error_message)
    VALUES (${id}, ${payloadSize}, ${responseStatus ?? null}, ${success}, ${errorMessage ?? null})
  `;
}

export function getWebhookLogs(webhookId?: number): Promise<DbWebhookLog[]> {
  if (webhookId) {
    return cast<DbWebhookLog>(sql`
      SELECT wl.id, wl.webhook_id, w.name AS webhook_name,
             wl.timestamp::text AS timestamp, wl.source,
             wl.payload_size, wl.response_status, wl.success,
             wl.retry_count, wl.error_message
      FROM webhook_logs wl
      LEFT JOIN webhooks w ON w.id = wl.webhook_id
      WHERE wl.webhook_id = ${webhookId}
      ORDER BY wl.timestamp DESC LIMIT 100
    `);
  }
  return cast<DbWebhookLog>(sql`
    SELECT wl.id, wl.webhook_id, w.name AS webhook_name,
           wl.timestamp::text AS timestamp, wl.source,
           wl.payload_size, wl.response_status, wl.success,
           wl.retry_count, wl.error_message
    FROM webhook_logs wl
    LEFT JOIN webhooks w ON w.id = wl.webhook_id
    ORDER BY wl.timestamp DESC LIMIT 200
  `);
}

// ─── Phase 7: Jobs ────────────────────────────────────────────────────────────

export function getJobs(filter?: { status?: string; queueType?: string }): Promise<DbJob[]> {
  if (filter?.status && filter.status !== "All") {
    return cast<DbJob>(sql`
      SELECT j.id, j.name, j.source, j.client_id, c.company_name AS client_name,
             j.status, j.queue_type,
             j.created_at::text AS created_at,
             j.started_at::text AS started_at,
             j.completed_at::text AS completed_at,
             j.duration_ms, j.error_message, j.retry_count, j.max_retries, j.payload
      FROM jobs j LEFT JOIN clients c ON c.id = j.client_id
      WHERE j.status = ${filter.status}
      ORDER BY j.created_at DESC LIMIT 200
    `);
  }
  return cast<DbJob>(sql`
    SELECT j.id, j.name, j.source, j.client_id, c.company_name AS client_name,
           j.status, j.queue_type,
           j.created_at::text AS created_at,
           j.started_at::text AS started_at,
           j.completed_at::text AS completed_at,
           j.duration_ms, j.error_message, j.retry_count, j.max_retries, j.payload
    FROM jobs j LEFT JOIN clients c ON c.id = j.client_id
    ORDER BY j.created_at DESC LIMIT 200
  `);
}

export async function createJob(data: {
  name: string; source?: string; clientId?: number | null; queueType?: string; payload?: string;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO jobs (name, source, client_id, queue_type, payload)
    VALUES (${data.name}, ${data.source ?? null}, ${data.clientId ?? null},
            ${data.queueType ?? "incoming"}, ${data.payload ?? null})
    RETURNING id
  `;
  return (rows as unknown as { id: number }[])[0];
}

export async function updateJobStatus(id: number, status: string, errorMessage?: string | null): Promise<void> {
  if (status === "Running") {
    await sql`UPDATE jobs SET status = ${status}, started_at = NOW() WHERE id = ${id}`;
  } else if (status === "Completed") {
    await sql`
      UPDATE jobs SET status = ${status}, completed_at = NOW(),
        duration_ms = EXTRACT(EPOCH FROM (NOW() - COALESCE(started_at, created_at))) * 1000
      WHERE id = ${id}
    `;
  } else if (status === "Failed" || status === "Retrying") {
    await sql`
      UPDATE jobs SET status = ${status}, error_message = ${errorMessage ?? null},
        retry_count = retry_count + 1
      WHERE id = ${id}
    `;
  } else {
    await sql`UPDATE jobs SET status = ${status} WHERE id = ${id}`;
  }
}

export async function getJobStats(): Promise<{
  queued: number; running: number; failed: number; completed: number; total: number;
  incoming: number; outgoing: number; scheduled: number; retry: number;
}> {
  const [byStatus, byQueue] = await Promise.all([
    sql`SELECT status, COUNT(*) AS cnt FROM jobs GROUP BY status` as Promise<any[]>,
    sql`SELECT queue_type, COUNT(*) AS cnt FROM jobs GROUP BY queue_type` as Promise<any[]>,
  ]);
  const s = Object.fromEntries((byStatus as any[]).map(r => [r.status, Number(r.cnt)]));
  const q = Object.fromEntries((byQueue as any[]).map(r => [r.queue_type, Number(r.cnt)]));
  return {
    queued:    s["Queued"]    ?? 0,
    running:   s["Running"]   ?? 0,
    failed:    s["Failed"]    ?? 0,
    completed: s["Completed"] ?? 0,
    total:     Object.values(s).reduce((a: number, b) => a + (b as number), 0),
    incoming:  q["incoming"]  ?? 0,
    outgoing:  q["outgoing"]  ?? 0,
    scheduled: q["scheduled"] ?? 0,
    retry:     q["retry"]     ?? 0,
  };
}

// ─── Phase 7: System Logs ─────────────────────────────────────────────────────

export function getSystemLogs(filter?: { level?: string; eventType?: string }): Promise<DbSystemLog[]> {
  if (filter?.level && filter.level !== "all") {
    return cast<DbSystemLog>(sql`
      SELECT sl.id, sl.event_type, sl.level, sl.message, sl.module,
             sl.client_id, c.company_name AS client_name,
             sl.job_id, sl.webhook_id, sl.metadata,
             sl.created_at::text AS created_at
      FROM system_logs sl LEFT JOIN clients c ON c.id = sl.client_id
      WHERE sl.level = ${filter.level}
      ORDER BY sl.created_at DESC LIMIT 500
    `);
  }
  if (filter?.eventType && filter.eventType !== "all") {
    return cast<DbSystemLog>(sql`
      SELECT sl.id, sl.event_type, sl.level, sl.message, sl.module,
             sl.client_id, c.company_name AS client_name,
             sl.job_id, sl.webhook_id, sl.metadata,
             sl.created_at::text AS created_at
      FROM system_logs sl LEFT JOIN clients c ON c.id = sl.client_id
      WHERE sl.event_type = ${filter.eventType}
      ORDER BY sl.created_at DESC LIMIT 500
    `);
  }
  return cast<DbSystemLog>(sql`
    SELECT sl.id, sl.event_type, sl.level, sl.message, sl.module,
           sl.client_id, c.company_name AS client_name,
           sl.job_id, sl.webhook_id, sl.metadata,
           sl.created_at::text AS created_at
    FROM system_logs sl LEFT JOIN clients c ON c.id = sl.client_id
    ORDER BY sl.created_at DESC LIMIT 500
  `);
}

export async function addSystemLog(data: {
  eventType: string; level: string; message: string;
  module?: string; clientId?: number | null; jobId?: number | null;
  webhookId?: number | null; metadata?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO system_logs (event_type, level, message, module, client_id, job_id, webhook_id, metadata)
    VALUES (${data.eventType}, ${data.level}, ${data.message},
            ${data.module ?? null}, ${data.clientId ?? null},
            ${data.jobId ?? null}, ${data.webhookId ?? null},
            ${data.metadata ?? null})
  `;
}

export async function getLogStats(): Promise<{
  total: number; errors: number; warnings: number; today: number;
}> {
  const rows = await sql`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) AS errors,
      SUM(CASE WHEN level = 'warn'  THEN 1 ELSE 0 END) AS warnings,
      SUM(CASE WHEN created_at >= CURRENT_DATE THEN 1 ELSE 0 END) AS today
    FROM system_logs
  ` as unknown as any[];
  const r = rows[0];
  return {
    total:    Number(r.total    ?? 0),
    errors:   Number(r.errors   ?? 0),
    warnings: Number(r.warnings ?? 0),
    today:    Number(r.today    ?? 0),
  };
}

// ─── Phase 7: Infrastructure health ──────────────────────────────────────────

export async function getInfrastructureHealth(): Promise<{
  connectedIntegrations: number;
  totalIntegrations: number;
  activeWebhooks: number;
  queuedJobs: number;
  failedJobs: number;
  recentErrors: number;
}> {
  const [integ, webhooks, jobStats, logStats] = await Promise.all([
    sql`SELECT COUNT(*) AS total, SUM(CASE WHEN enabled THEN 1 ELSE 0 END) AS connected FROM integrations` as Promise<any[]>,
    sql`SELECT COUNT(*) AS active FROM webhooks WHERE status = 'Active'` as Promise<any[]>,
    sql`SELECT
          SUM(CASE WHEN status = 'Queued'  THEN 1 ELSE 0 END) AS queued,
          SUM(CASE WHEN status = 'Failed'  THEN 1 ELSE 0 END) AS failed
        FROM jobs` as Promise<any[]>,
    sql`SELECT COUNT(*) AS errors FROM system_logs WHERE level = 'error' AND created_at >= NOW() - INTERVAL '24 hours'` as Promise<any[]>,
  ]);
  return {
    connectedIntegrations: Number((integ as any[])[0].connected ?? 0),
    totalIntegrations:     Number((integ as any[])[0].total    ?? 0),
    activeWebhooks:        Number((webhooks as any[])[0].active  ?? 0),
    queuedJobs:            Number((jobStats as any[])[0].queued  ?? 0),
    failedJobs:            Number((jobStats as any[])[0].failed  ?? 0),
    recentErrors:          Number((logStats as any[])[0].errors  ?? 0),
  };
}

// ─── Phase 7: Credential value (server-side only — never expose to client) ────

export async function getCredentialValue(integrationId: number, service?: string): Promise<string | null> {
  const rows = service
    ? await sql`
        SELECT key_value FROM integration_credentials
        WHERE integration_id = ${integrationId} AND service = ${service} AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
      ` as unknown as { key_value: string | null }[]
    : await sql`
        SELECT key_value FROM integration_credentials
        WHERE integration_id = ${integrationId} AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
      ` as unknown as { key_value: string | null }[];
  return rows[0]?.key_value ?? null;
}

export async function getCredentialValueByService(service: string): Promise<string | null> {
  const rows = await sql`
    SELECT key_value FROM integration_credentials
    WHERE service = ${service} AND status = 'active'
    ORDER BY created_at DESC LIMIT 1
  ` as unknown as { key_value: string | null }[];
  return rows[0]?.key_value ?? null;
}

// ─── Phase 8: Email Config ─────────────────────────────────────────────────────

export async function getEmailConfig(): Promise<DbEmailConfig | null> {
  const rows = await cast<DbEmailConfig>(sql`
    SELECT id, provider, integration_id, smtp_host, smtp_port, smtp_secure,
           smtp_user, from_name, from_email, is_active,
           last_test_at::text AS last_test_at, last_test_success,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM email_config WHERE is_active = TRUE ORDER BY updated_at DESC LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function getAllEmailConfigs(): Promise<DbEmailConfig[]> {
  return cast<DbEmailConfig>(sql`
    SELECT id, provider, integration_id, smtp_host, smtp_port, smtp_secure,
           smtp_user, from_name, from_email, is_active,
           last_test_at::text AS last_test_at, last_test_success,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM email_config ORDER BY updated_at DESC
  `);
}

export async function upsertEmailConfig(data: {
  provider: string; integrationId?: number | null;
  smtpHost?: string | null; smtpPort?: number; smtpSecure?: boolean; smtpUser?: string | null;
  fromName: string; fromEmail: string;
}): Promise<{ id: number }> {
  await sql`UPDATE email_config SET is_active = FALSE`;
  const rows = await sql`
    INSERT INTO email_config
      (provider, integration_id, smtp_host, smtp_port, smtp_secure, smtp_user, from_name, from_email, is_active, updated_at)
    VALUES
      (${data.provider}, ${data.integrationId ?? null}, ${data.smtpHost ?? null},
       ${data.smtpPort ?? 587}, ${data.smtpSecure ?? false}, ${data.smtpUser ?? null},
       ${data.fromName}, ${data.fromEmail}, TRUE, NOW())
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function updateEmailConfigTest(id: number, success: boolean): Promise<void> {
  await sql`
    UPDATE email_config SET last_test_at = NOW(), last_test_success = ${success}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function createEmailLog(data: {
  recipient: string; subject: string; template?: string | null;
  status: string; provider?: string | null; errorMessage?: string | null; metadata?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO email_logs (recipient, subject, template, status, provider, error_message, metadata)
    VALUES (${data.recipient}, ${data.subject}, ${data.template ?? null},
            ${data.status}, ${data.provider ?? null}, ${data.errorMessage ?? null}, ${data.metadata ?? null})
  `;
}

export function getEmailLogs(limit = 50): Promise<DbEmailLog[]> {
  return cast<DbEmailLog>(sql`
    SELECT id, recipient, subject, template, status, provider, error_message, metadata,
           sent_at::text AS sent_at
    FROM email_logs ORDER BY sent_at DESC LIMIT ${limit}
  `);
}

export async function getEmailStats(): Promise<{ total: number; sent: number; failed: number; todaySent: number }> {
  const rows = await sql`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Sent'   THEN 1 ELSE 0 END) AS sent,
      SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN status = 'Sent' AND sent_at >= CURRENT_DATE THEN 1 ELSE 0 END) AS today_sent
    FROM email_logs
  ` as unknown as any[];
  const r = rows[0];
  return { total: Number(r.total ?? 0), sent: Number(r.sent ?? 0), failed: Number(r.failed ?? 0), todaySent: Number(r.today_sent ?? 0) };
}

// ─── Phase 8: Apollo Leads ─────────────────────────────────────────────────────

export function getApolloLeads(clientId?: number, limit = 200): Promise<DbApolloLead[]> {
  if (clientId) {
    return cast<DbApolloLead>(sql`
      SELECT id, client_id, name, company, title, email, linkedin_url, industry,
             company_size, location, source, apollo_id,
             import_date::text AS import_date, job_id,
             created_at::text AS created_at
      FROM apollo_leads WHERE client_id = ${clientId}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbApolloLead>(sql`
    SELECT id, client_id, name, company, title, email, linkedin_url, industry,
           company_size, location, source, apollo_id,
           import_date::text AS import_date, job_id,
           created_at::text AS created_at
    FROM apollo_leads ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function getApolloLeadCount(clientId?: number): Promise<number> {
  const rows = clientId
    ? await sql`SELECT COUNT(*) AS cnt FROM apollo_leads WHERE client_id = ${clientId}` as unknown as any[]
    : await sql`SELECT COUNT(*) AS cnt FROM apollo_leads` as unknown as any[];
  return Number(rows[0].cnt ?? 0);
}

export async function createApolloLeadsBatch(leads: {
  name: string; company?: string | null; title?: string | null; email?: string | null;
  linkedinUrl?: string | null; industry?: string | null; companySize?: string | null;
  location?: string | null; apolloId?: string | null; clientId?: number | null; jobId?: number | null;
}[]): Promise<number> {
  let created = 0;
  for (const lead of leads) {
    try {
      await sql`
        INSERT INTO apollo_leads
          (name, company, title, email, linkedin_url, industry, company_size, location, apollo_id, client_id, job_id)
        VALUES
          (${lead.name}, ${lead.company ?? null}, ${lead.title ?? null}, ${lead.email ?? null},
           ${lead.linkedinUrl ?? null}, ${lead.industry ?? null}, ${lead.companySize ?? null},
           ${lead.location ?? null}, ${lead.apolloId ?? null}, ${lead.clientId ?? null}, ${lead.jobId ?? null})
        ON CONFLICT (apollo_id) DO NOTHING
      `;
      created++;
    } catch { /* skip dupes */ }
  }
  return created;
}

// ─── Phase 8: Instantly Campaigns ─────────────────────────────────────────────

export function getInstantlyCampaigns(): Promise<DbInstantlyCampaign[]> {
  return cast<DbInstantlyCampaign>(sql`
    SELECT id, campaign_id, name, status, sent, opened, replied, positive_replies, meetings_booked,
           last_sync::text AS last_sync,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM instantly_campaigns ORDER BY updated_at DESC
  `);
}

export async function upsertInstantlyCampaign(data: {
  campaignId: string; name: string; status: string;
  sent: number; opened: number; replied: number; positiveReplies: number; meetingsBooked: number;
}): Promise<void> {
  await sql`
    INSERT INTO instantly_campaigns
      (campaign_id, name, status, sent, opened, replied, positive_replies, meetings_booked, last_sync)
    VALUES
      (${data.campaignId}, ${data.name}, ${data.status}, ${data.sent}, ${data.opened},
       ${data.replied}, ${data.positiveReplies}, ${data.meetingsBooked}, NOW())
    ON CONFLICT (campaign_id) DO UPDATE SET
      name = EXCLUDED.name, status = EXCLUDED.status, sent = EXCLUDED.sent,
      opened = EXCLUDED.opened, replied = EXCLUDED.replied,
      positive_replies = EXCLUDED.positive_replies, meetings_booked = EXCLUDED.meetings_booked,
      last_sync = NOW(), updated_at = NOW()
  `;
}

export async function getInstantlyStats(): Promise<{ campaigns: number; totalSent: number; totalReplied: number; totalMeetings: number }> {
  const rows = await sql`
    SELECT COUNT(*) AS campaigns, SUM(sent) AS total_sent,
           SUM(replied) AS total_replied, SUM(meetings_booked) AS total_meetings
    FROM instantly_campaigns
  ` as unknown as any[];
  const r = rows[0];
  return {
    campaigns:     Number(r.campaigns     ?? 0),
    totalSent:     Number(r.total_sent    ?? 0),
    totalReplied:  Number(r.total_replied ?? 0),
    totalMeetings: Number(r.total_meetings ?? 0),
  };
}

// ─── Phase 8: CRM Contacts ─────────────────────────────────────────────────────

export function getCrmContacts(source?: string, limit = 200): Promise<DbCrmContact[]> {
  if (source) {
    return cast<DbCrmContact>(sql`
      SELECT id, source, external_id, name, email, company, title, phone,
             client_id, deal_id, last_sync::text AS last_sync, metadata,
             created_at::text AS created_at
      FROM crm_contacts WHERE source = ${source}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbCrmContact>(sql`
    SELECT id, source, external_id, name, email, company, title, phone,
           client_id, deal_id, last_sync::text AS last_sync, metadata,
           created_at::text AS created_at
    FROM crm_contacts ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function upsertCrmContact(data: {
  source: string; externalId: string; name?: string | null; email?: string | null;
  company?: string | null; title?: string | null; phone?: string | null;
  clientId?: number | null; dealId?: number | null; metadata?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO crm_contacts
      (source, external_id, name, email, company, title, phone, client_id, deal_id, last_sync, metadata)
    VALUES
      (${data.source}, ${data.externalId}, ${data.name ?? null}, ${data.email ?? null},
       ${data.company ?? null}, ${data.title ?? null}, ${data.phone ?? null},
       ${data.clientId ?? null}, ${data.dealId ?? null}, NOW(), ${data.metadata ?? null})
    ON CONFLICT (source, external_id) DO UPDATE SET
      name = EXCLUDED.name, email = EXCLUDED.email, company = EXCLUDED.company,
      title = EXCLUDED.title, phone = EXCLUDED.phone, last_sync = NOW(),
      metadata = EXCLUDED.metadata
  `;
}

export function getCrmDeals(source?: string, limit = 200): Promise<DbCrmDeal[]> {
  if (source) {
    return cast<DbCrmDeal>(sql`
      SELECT id, source, external_id, title, value::float AS value, stage, status,
             contact_name, company, client_id, deal_id, last_sync::text AS last_sync, metadata,
             created_at::text AS created_at
      FROM crm_deals WHERE source = ${source}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbCrmDeal>(sql`
    SELECT id, source, external_id, title, value::float AS value, stage, status,
           contact_name, company, client_id, deal_id, last_sync::text AS last_sync, metadata,
           created_at::text AS created_at
    FROM crm_deals ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function upsertCrmDeal(data: {
  source: string; externalId: string; title?: string | null; value?: number | null;
  stage?: string | null; status?: string | null; contactName?: string | null;
  company?: string | null; clientId?: number | null; dealId?: number | null; metadata?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO crm_deals
      (source, external_id, title, value, stage, status, contact_name, company,
       client_id, deal_id, last_sync, metadata)
    VALUES
      (${data.source}, ${data.externalId}, ${data.title ?? null}, ${data.value ?? null},
       ${data.stage ?? null}, ${data.status ?? null}, ${data.contactName ?? null},
       ${data.company ?? null}, ${data.clientId ?? null}, ${data.dealId ?? null},
       NOW(), ${data.metadata ?? null})
    ON CONFLICT (source, external_id) DO UPDATE SET
      title = EXCLUDED.title, value = EXCLUDED.value, stage = EXCLUDED.stage,
      status = EXCLUDED.status, last_sync = NOW(), metadata = EXCLUDED.metadata
  `;
}

export async function getCrmStats(): Promise<{
  hubspotContacts: number; hubspotDeals: number;
  pipedriveContacts: number; pipedriveDeals: number;
  totalContacts: number; totalDeals: number;
}> {
  const [contacts, deals] = await Promise.all([
    sql`SELECT source, COUNT(*) AS cnt FROM crm_contacts GROUP BY source` as Promise<any[]>,
    sql`SELECT source, COUNT(*) AS cnt FROM crm_deals GROUP BY source` as Promise<any[]>,
  ]);
  const c = Object.fromEntries((contacts as any[]).map(r => [r.source, Number(r.cnt)]));
  const d = Object.fromEntries((deals as any[]).map(r => [r.source, Number(r.cnt)]));
  return {
    hubspotContacts:   c["hubspot"]   ?? 0,
    hubspotDeals:      d["hubspot"]   ?? 0,
    pipedriveContacts: c["pipedrive"] ?? 0,
    pipedriveDeals:    d["pipedrive"] ?? 0,
    totalContacts: Object.values(c).reduce((a: number, b) => a + (b as number), 0),
    totalDeals:    Object.values(d).reduce((a: number, b) => a + (b as number), 0),
  };
}

// ─── Phase 8: Sync History ─────────────────────────────────────────────────────

export async function createSyncHistory(data: {
  integrationId?: number | null; operation: string; jobId?: number | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO sync_history (integration_id, operation, job_id)
    VALUES (${data.integrationId ?? null}, ${data.operation}, ${data.jobId ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function completeSyncHistory(id: number, data: {
  status: string; recordsProcessed: number; recordsCreated: number; recordsUpdated: number;
  errorMessage?: string | null; durationMs?: number | null;
}): Promise<void> {
  await sql`
    UPDATE sync_history SET
      status = ${data.status}, records_processed = ${data.recordsProcessed},
      records_created = ${data.recordsCreated}, records_updated = ${data.recordsUpdated},
      error_message = ${data.errorMessage ?? null}, duration_ms = ${data.durationMs ?? null},
      completed_at = NOW()
    WHERE id = ${id}
  `;
}

export function getSyncHistory(integrationId?: number, limit = 100): Promise<DbSyncHistory[]> {
  if (integrationId) {
    return cast<DbSyncHistory>(sql`
      SELECT sh.id, sh.integration_id, i.name AS integration_name,
             sh.operation, sh.status, sh.records_processed, sh.records_created,
             sh.records_updated, sh.error_message, sh.duration_ms, sh.job_id,
             sh.started_at::text AS started_at, sh.completed_at::text AS completed_at
      FROM sync_history sh
      LEFT JOIN integrations i ON i.id = sh.integration_id
      WHERE sh.integration_id = ${integrationId}
      ORDER BY sh.started_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbSyncHistory>(sql`
    SELECT sh.id, sh.integration_id, i.name AS integration_name,
           sh.operation, sh.status, sh.records_processed, sh.records_created,
           sh.records_updated, sh.error_message, sh.duration_ms, sh.job_id,
           sh.started_at::text AS started_at, sh.completed_at::text AS completed_at
    FROM sync_history sh
    LEFT JOIN integrations i ON i.id = sh.integration_id
    ORDER BY sh.started_at DESC LIMIT ${limit}
  `);
}

export async function getSyncStats(): Promise<{ total: number; success: number; failed: number; today: number }> {
  const rows = await sql`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) AS success,
      SUM(CASE WHEN status = 'Failed'  THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN started_at >= CURRENT_DATE THEN 1 ELSE 0 END) AS today
    FROM sync_history
  ` as unknown as any[];
  const r = rows[0];
  return { total: Number(r.total ?? 0), success: Number(r.success ?? 0), failed: Number(r.failed ?? 0), today: Number(r.today ?? 0) };
}

// ─── Phase 8: Integration by slug ─────────────────────────────────────────────

export async function getIntegrationBySlug(slug: string): Promise<DbIntegration | null> {
  const rows = await cast<DbIntegration>(sql`
    SELECT id, name, slug, COALESCE(category, 'other') AS category,
           status, enabled, health_score,
           last_sync::text AS last_sync, last_error,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM integrations WHERE slug = ${slug} LIMIT 1
  `);
  return rows[0] ?? null;
}

// ─── Phase 9: AI Jobs ─────────────────────────────────────────────────────────

export function getAiJobs(limit = 100): Promise<DbAiJob[]> {
  return cast<DbAiJob>(sql`
    SELECT id, job_id, task_type, status, subject_id, subject_type, subject_name,
           result_id, result_type, error_message,
           created_at::text AS created_at, completed_at::text AS completed_at
    FROM ai_jobs ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function createAiJob(data: {
  jobId?: number | null; taskType: string;
  subjectId?: number | null; subjectType?: string | null; subjectName?: string | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO ai_jobs (job_id, task_type, status, subject_id, subject_type, subject_name)
    VALUES (${data.jobId ?? null}, ${data.taskType}, 'Running',
            ${data.subjectId ?? null}, ${data.subjectType ?? null}, ${data.subjectName ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function completeAiJob(id: number, resultId?: number | null, resultType?: string | null): Promise<void> {
  await sql`
    UPDATE ai_jobs SET status = 'Completed', result_id = ${resultId ?? null},
      result_type = ${resultType ?? null}, completed_at = NOW()
    WHERE id = ${id}
  `;
}

export async function failAiJob(id: number, errorMessage: string): Promise<void> {
  await sql`
    UPDATE ai_jobs SET status = 'Failed', error_message = ${errorMessage}, completed_at = NOW()
    WHERE id = ${id}
  `;
}

// ─── Phase 9: AI Prompts ──────────────────────────────────────────────────────

export function getAiPrompts(): Promise<DbAiPrompt[]> {
  return cast<DbAiPrompt>(sql`
    SELECT id, name, category, description, prompt, is_active, is_default, version,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM ai_prompts ORDER BY is_default DESC, category ASC, name ASC
  `);
}

export async function getAiPromptByCategory(category: string): Promise<DbAiPrompt | null> {
  const rows = await cast<DbAiPrompt>(sql`
    SELECT id, name, category, description, prompt, is_active, is_default, version,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM ai_prompts
    WHERE category = ${category} AND is_active = TRUE
    ORDER BY is_default DESC, updated_at DESC LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function createAiPrompt(data: {
  name: string; category: string; description?: string | null; prompt: string;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO ai_prompts (name, category, description, prompt)
    VALUES (${data.name}, ${data.category}, ${data.description ?? null}, ${data.prompt})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function updateAiPrompt(id: number, data: {
  name?: string; description?: string | null; prompt?: string; isActive?: boolean;
}): Promise<void> {
  const ops: Promise<unknown>[] = [];
  if (data.name      !== undefined) ops.push(sql`UPDATE ai_prompts SET name = ${data.name}, updated_at = NOW() WHERE id = ${id}`);
  if (data.description !== undefined) ops.push(sql`UPDATE ai_prompts SET description = ${data.description}, updated_at = NOW() WHERE id = ${id}`);
  if (data.prompt    !== undefined) ops.push(sql`UPDATE ai_prompts SET prompt = ${data.prompt}, version = version + 1, updated_at = NOW() WHERE id = ${id}`);
  if (data.isActive  !== undefined) ops.push(sql`UPDATE ai_prompts SET is_active = ${data.isActive}, updated_at = NOW() WHERE id = ${id}`);
  await Promise.all(ops);
}

export async function deleteAiPrompt(id: number): Promise<void> {
  await sql`DELETE FROM ai_prompts WHERE id = ${id} AND is_default = FALSE`;
}

// ─── Phase 9: Lead Scores ─────────────────────────────────────────────────────

export function getLeadScores(limit = 200): Promise<(DbLeadScore & { lead_name: string; lead_company: string | null })[]> {
  return cast<DbLeadScore & { lead_name: string; lead_company: string | null }>(sql`
    SELECT ls.id, ls.apollo_lead_id, al.name AS lead_name, al.company AS lead_company,
           ls.score, ls.confidence, ls.reason, ls.model,
           ls.tokens_input, ls.tokens_output,
           ls.created_at::text AS created_at
    FROM lead_scores ls
    JOIN apollo_leads al ON al.id = ls.apollo_lead_id
    ORDER BY ls.created_at DESC LIMIT ${limit}
  `);
}

export async function getLeadScoreByLeadId(leadId: number): Promise<DbLeadScore | null> {
  const rows = await cast<DbLeadScore>(sql`
    SELECT id, apollo_lead_id, score, confidence, reason, model,
           tokens_input, tokens_output, created_at::text AS created_at
    FROM lead_scores WHERE apollo_lead_id = ${leadId}
    ORDER BY created_at DESC LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function createLeadScore(data: {
  apolloLeadId: number; score: string; confidence?: number | null; reason?: string | null;
  model?: string | null; tokensInput?: number | null; tokensOutput?: number | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO lead_scores (apollo_lead_id, score, confidence, reason, model, tokens_input, tokens_output)
    VALUES (${data.apolloLeadId}, ${data.score}, ${data.confidence ?? null}, ${data.reason ?? null},
            ${data.model ?? null}, ${data.tokensInput ?? null}, ${data.tokensOutput ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function getUnscoredLeadCount(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) AS cnt FROM apollo_leads al
    WHERE NOT EXISTS (SELECT 1 FROM lead_scores ls WHERE ls.apollo_lead_id = al.id)
  ` as unknown as any[];
  return Number(rows[0].cnt ?? 0);
}

export async function getLeadScoreStats(): Promise<{ total: number; hot: number; warm: number; cold: number; disqualified: number; unscored: number }> {
  const [scored, total] = await Promise.all([
    sql`SELECT score, COUNT(*) AS cnt FROM lead_scores GROUP BY score` as Promise<any[]>,
    sql`SELECT COUNT(*) AS cnt FROM apollo_leads` as unknown as Promise<any[]>,
  ]);
  const s = Object.fromEntries((scored as any[]).map(r => [r.score, Number(r.cnt)]));
  const totalLeads = Number((total as any[])[0]?.cnt ?? 0);
  const totalScored = (s["Hot"] ?? 0) + (s["Warm"] ?? 0) + (s["Cold"] ?? 0) + (s["Disqualified"] ?? 0);
  return {
    total:         totalLeads,
    hot:           s["Hot"]          ?? 0,
    warm:          s["Warm"]         ?? 0,
    cold:          s["Cold"]         ?? 0,
    disqualified:  s["Disqualified"] ?? 0,
    unscored:      totalLeads - totalScored,
  };
}

// ─── Phase 9: Research Reports ────────────────────────────────────────────────

export function getResearchReports(limit = 50): Promise<DbResearchReport[]> {
  return cast<DbResearchReport>(sql`
    SELECT id, report_type, subject_name, subject_company, input_data, report_markdown,
           model, tokens_input, tokens_output, client_id,
           created_at::text AS created_at
    FROM research_reports ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function createResearchReport(data: {
  reportType: string; subjectName: string; subjectCompany?: string | null;
  inputData?: string | null; reportMarkdown: string;
  model?: string | null; tokensInput?: number | null; tokensOutput?: number | null;
  clientId?: number | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO research_reports
      (report_type, subject_name, subject_company, input_data, report_markdown,
       model, tokens_input, tokens_output, client_id)
    VALUES
      (${data.reportType}, ${data.subjectName}, ${data.subjectCompany ?? null},
       ${data.inputData ?? null}, ${data.reportMarkdown},
       ${data.model ?? null}, ${data.tokensInput ?? null}, ${data.tokensOutput ?? null},
       ${data.clientId ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

// ─── Phase 9: AI Insights ─────────────────────────────────────────────────────

export function getAiInsights(insightType?: string, limit = 50): Promise<DbAiInsight[]> {
  if (insightType) {
    return cast<DbAiInsight>(sql`
      SELECT id, insight_type, title, subject_id, subject_name, input_data, insight_markdown,
             model, tokens_input, tokens_output, client_id,
             created_at::text AS created_at
      FROM ai_insights WHERE insight_type = ${insightType}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbAiInsight>(sql`
    SELECT id, insight_type, title, subject_id, subject_name, input_data, insight_markdown,
           model, tokens_input, tokens_output, client_id,
           created_at::text AS created_at
    FROM ai_insights ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function createAiInsight(data: {
  insightType: string; title: string; subjectId?: number | null; subjectName?: string | null;
  inputData?: string | null; insightMarkdown: string;
  model?: string | null; tokensInput?: number | null; tokensOutput?: number | null;
  clientId?: number | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO ai_insights
      (insight_type, title, subject_id, subject_name, input_data, insight_markdown,
       model, tokens_input, tokens_output, client_id)
    VALUES
      (${data.insightType}, ${data.title}, ${data.subjectId ?? null}, ${data.subjectName ?? null},
       ${data.inputData ?? null}, ${data.insightMarkdown},
       ${data.model ?? null}, ${data.tokensInput ?? null}, ${data.tokensOutput ?? null},
       ${data.clientId ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

// ─── Phase 9: Reply Classifications ──────────────────────────────────────────

export function getReplyClassifications(campaignId?: string, limit = 200): Promise<DbReplyClassification[]> {
  if (campaignId) {
    return cast<DbReplyClassification>(sql`
      SELECT id, campaign_id, reply_id, contact_name, contact_email, reply_text,
             classification, confidence, reason, model, tokens_input, tokens_output,
             created_at::text AS created_at
      FROM reply_classifications WHERE campaign_id = ${campaignId}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbReplyClassification>(sql`
    SELECT id, campaign_id, reply_id, contact_name, contact_email, reply_text,
           classification, confidence, reason, model, tokens_input, tokens_output,
           created_at::text AS created_at
    FROM reply_classifications ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function createReplyClassification(data: {
  campaignId?: string | null; replyId?: string | null;
  contactName?: string | null; contactEmail?: string | null; replyText?: string | null;
  classification: string; confidence?: number | null; reason?: string | null;
  model?: string | null; tokensInput?: number | null; tokensOutput?: number | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO reply_classifications
      (campaign_id, reply_id, contact_name, contact_email, reply_text,
       classification, confidence, reason, model, tokens_input, tokens_output)
    VALUES
      (${data.campaignId ?? null}, ${data.replyId ?? null},
       ${data.contactName ?? null}, ${data.contactEmail ?? null}, ${data.replyText ?? null},
       ${data.classification}, ${data.confidence ?? null}, ${data.reason ?? null},
       ${data.model ?? null}, ${data.tokensInput ?? null}, ${data.tokensOutput ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

// ─── Phase 9: AI Usage ────────────────────────────────────────────────────────

export async function createAiUsage(data: {
  taskType: string; model: string; tokensInput: number; tokensOutput: number;
  costUsd?: number | null; responseTimeMs?: number | null; clientId?: number | null;
}): Promise<void> {
  await sql`
    INSERT INTO ai_usage (task_type, model, tokens_input, tokens_output, cost_usd, response_time_ms, client_id)
    VALUES (${data.taskType}, ${data.model}, ${data.tokensInput}, ${data.tokensOutput},
            ${data.costUsd ?? null}, ${data.responseTimeMs ?? null}, ${data.clientId ?? null})
  `;
}

export async function getAiUsageTotals(): Promise<{
  totalRequests: number; totalTokensIn: number; totalTokensOut: number;
  totalCostUsd: number; avgResponseMs: number; todayRequests: number;
}> {
  const rows = await sql`
    SELECT
      COUNT(*) AS total_requests,
      COALESCE(SUM(tokens_input), 0)       AS total_tokens_in,
      COALESCE(SUM(tokens_output), 0)      AS total_tokens_out,
      COALESCE(SUM(cost_usd), 0)           AS total_cost,
      COALESCE(AVG(response_time_ms), 0)   AS avg_response_ms,
      SUM(CASE WHEN created_at >= CURRENT_DATE THEN 1 ELSE 0 END) AS today_requests
    FROM ai_usage
  ` as unknown as any[];
  const r = rows[0];
  return {
    totalRequests:   Number(r.total_requests  ?? 0),
    totalTokensIn:   Number(r.total_tokens_in  ?? 0),
    totalTokensOut:  Number(r.total_tokens_out ?? 0),
    totalCostUsd:    Number(r.total_cost       ?? 0),
    avgResponseMs:   Number(r.avg_response_ms  ?? 0),
    todayRequests:   Number(r.today_requests   ?? 0),
  };
}

// ─── Phase 10: Plans ──────────────────────────────────────────────────────────

export function getPlans(activeOnly = false): Promise<DbPlan[]> {
  if (activeOnly) {
    return cast<DbPlan>(sql`
      SELECT id, name, slug, tier, description,
             price_monthly::float AS price_monthly,
             price_annual::float  AS price_annual,
             COALESCE(features, '{}') AS features,
             billing_cycle, status, stripe_price_id, stripe_product_id,
             created_at::text AS created_at, updated_at::text AS updated_at
      FROM plans WHERE status = 'Active' ORDER BY price_monthly ASC
    `);
  }
  return cast<DbPlan>(sql`
    SELECT id, name, slug, tier, description,
           price_monthly::float AS price_monthly,
           price_annual::float  AS price_annual,
           COALESCE(features, '{}') AS features,
           billing_cycle, status, stripe_price_id, stripe_product_id,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM plans ORDER BY price_monthly ASC
  `);
}

export async function getPlanBySlug(slug: string): Promise<DbPlan | null> {
  const rows = await cast<DbPlan>(sql`
    SELECT id, name, slug, tier, description,
           price_monthly::float AS price_monthly,
           price_annual::float  AS price_annual,
           COALESCE(features, '{}') AS features,
           billing_cycle, status, stripe_price_id, stripe_product_id,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM plans WHERE slug = ${slug} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function createPlan(data: {
  name: string; slug: string; tier?: string | null; description?: string | null;
  priceMonthly: number; priceAnnual?: number | null; features?: string[];
  billingCycle?: string; stripePriceId?: string | null; stripeProductId?: string | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO plans (name, slug, tier, description, price_monthly, price_annual, features,
                       billing_cycle, stripe_price_id, stripe_product_id)
    VALUES (${data.name}, ${data.slug}, ${data.tier ?? null}, ${data.description ?? null},
            ${data.priceMonthly}, ${data.priceAnnual ?? null},
            ${data.features ?? []},
            ${data.billingCycle ?? 'monthly'}, ${data.stripePriceId ?? null}, ${data.stripeProductId ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function updatePlan(id: number, data: {
  name?: string; description?: string | null; priceMonthly?: number;
  priceAnnual?: number | null; features?: string[]; status?: string;
  stripePriceId?: string | null; stripeProductId?: string | null;
  paypalPlanId?: string | null; paypalProductId?: string | null;
}): Promise<void> {
  const ops: Promise<unknown>[] = [];
  if (data.name            !== undefined) ops.push(sql`UPDATE plans SET name = ${data.name}, updated_at = NOW() WHERE id = ${id}`);
  if (data.description     !== undefined) ops.push(sql`UPDATE plans SET description = ${data.description}, updated_at = NOW() WHERE id = ${id}`);
  if (data.priceMonthly    !== undefined) ops.push(sql`UPDATE plans SET price_monthly = ${data.priceMonthly}, updated_at = NOW() WHERE id = ${id}`);
  if (data.priceAnnual     !== undefined) ops.push(sql`UPDATE plans SET price_annual = ${data.priceAnnual}, updated_at = NOW() WHERE id = ${id}`);
  if (data.features        !== undefined) ops.push(sql`UPDATE plans SET features = ${data.features}, updated_at = NOW() WHERE id = ${id}`);
  if (data.status          !== undefined) ops.push(sql`UPDATE plans SET status = ${data.status}, updated_at = NOW() WHERE id = ${id}`);
  if (data.stripePriceId   !== undefined) ops.push(sql`UPDATE plans SET stripe_price_id = ${data.stripePriceId}, updated_at = NOW() WHERE id = ${id}`);
  if (data.stripeProductId !== undefined) ops.push(sql`UPDATE plans SET stripe_product_id = ${data.stripeProductId}, updated_at = NOW() WHERE id = ${id}`);
  if (data.paypalPlanId    !== undefined) ops.push(sql`UPDATE plans SET paypal_plan_id = ${data.paypalPlanId}, updated_at = NOW() WHERE id = ${id}`);
  if (data.paypalProductId !== undefined) ops.push(sql`UPDATE plans SET paypal_product_id = ${data.paypalProductId}, updated_at = NOW() WHERE id = ${id}`);
  await Promise.all(ops);
}

// ─── Phase 10: Stripe Customers ───────────────────────────────────────────────

export async function getStripeCustomer(clientId: number): Promise<DbStripeCustomer | null> {
  const rows = await cast<DbStripeCustomer>(sql`
    SELECT id, client_id, stripe_customer_id, email, name,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM stripe_customers WHERE client_id = ${clientId} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function upsertStripeCustomer(data: {
  clientId: number; stripeCustomerId: string; email?: string | null; name?: string | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO stripe_customers (client_id, stripe_customer_id, email, name)
    VALUES (${data.clientId}, ${data.stripeCustomerId}, ${data.email ?? null}, ${data.name ?? null})
    ON CONFLICT (stripe_customer_id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, updated_at = NOW()
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

// ─── Phase 10: Subscriptions ──────────────────────────────────────────────────

export function getSubscriptions(clientId?: number): Promise<DbSubscription[]> {
  if (clientId) {
    return cast<DbSubscription>(sql`
      SELECT s.id, s.client_id, c.company_name AS client_name,
             s.stripe_customer_id, s.stripe_subscription_id,
             s.plan_id, s.plan_name, s.tier, s.status,
             s.current_period_start::text AS current_period_start,
             s.current_period_end::text AS current_period_end,
             s.trial_end::text AS trial_end,
             s.cancel_at::text AS cancel_at, s.cancelled_at::text AS cancelled_at,
             s.mrr::float AS mrr, s.arr::float AS arr, s.notes,
             s.created_at::text AS created_at, s.updated_at::text AS updated_at
      FROM subscriptions s JOIN clients c ON c.id = s.client_id
      WHERE s.client_id = ${clientId}
      ORDER BY s.created_at DESC
    `);
  }
  return cast<DbSubscription>(sql`
    SELECT s.id, s.client_id, c.company_name AS client_name,
           s.stripe_customer_id, s.stripe_subscription_id,
           s.plan_id, s.plan_name, s.tier, s.status,
           s.current_period_start::text AS current_period_start,
           s.current_period_end::text AS current_period_end,
           s.trial_end::text AS trial_end,
           s.cancel_at::text AS cancel_at, s.cancelled_at::text AS cancelled_at,
           s.mrr::float AS mrr, s.arr::float AS arr, s.notes,
           s.created_at::text AS created_at, s.updated_at::text AS updated_at
    FROM subscriptions s JOIN clients c ON c.id = s.client_id
    ORDER BY s.created_at DESC
  `);
}

export async function getActiveSubscription(clientId: number): Promise<DbSubscription | null> {
  const rows = await cast<DbSubscription>(sql`
    SELECT s.id, s.client_id, c.company_name AS client_name,
           s.stripe_customer_id, s.stripe_subscription_id,
           s.plan_id, s.plan_name, s.tier, s.status,
           s.current_period_start::text AS current_period_start,
           s.current_period_end::text AS current_period_end,
           s.trial_end::text AS trial_end,
           s.cancel_at::text AS cancel_at, s.cancelled_at::text AS cancelled_at,
           s.mrr::float AS mrr, s.arr::float AS arr, s.notes,
           s.created_at::text AS created_at, s.updated_at::text AS updated_at
    FROM subscriptions s JOIN clients c ON c.id = s.client_id
    WHERE s.client_id = ${clientId} AND s.status IN ('Active','Trial','Past Due')
    ORDER BY s.created_at DESC LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function createSubscription(data: {
  clientId: number; planId?: number | null; planName?: string | null; tier?: string | null;
  status?: string; mrr?: number | null; arr?: number | null; notes?: string | null;
  currentPeriodStart?: string | null; currentPeriodEnd?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO subscriptions
      (client_id, plan_id, plan_name, tier, status, mrr, arr, notes,
       current_period_start, current_period_end, stripe_subscription_id)
    VALUES
      (${data.clientId}, ${data.planId ?? null}, ${data.planName ?? null},
       ${data.tier ?? null}, ${data.status ?? 'Active'},
       ${data.mrr ?? null}, ${data.arr ?? null}, ${data.notes ?? null},
       ${data.currentPeriodStart ?? null}, ${data.currentPeriodEnd ?? null},
       ${data.stripeSubscriptionId ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function updateSubscription(id: number, data: {
  status?: string; planId?: number | null; planName?: string | null;
  tier?: string | null; mrr?: number | null; arr?: number | null;
  currentPeriodStart?: string | null; currentPeriodEnd?: string | null;
  cancelledAt?: string | null; notes?: string | null;
}): Promise<void> {
  const ops: Promise<unknown>[] = [];
  if (data.status             !== undefined) ops.push(sql`UPDATE subscriptions SET status = ${data.status}, updated_at = NOW() WHERE id = ${id}`);
  if (data.planId             !== undefined) ops.push(sql`UPDATE subscriptions SET plan_id = ${data.planId}, updated_at = NOW() WHERE id = ${id}`);
  if (data.planName           !== undefined) ops.push(sql`UPDATE subscriptions SET plan_name = ${data.planName}, updated_at = NOW() WHERE id = ${id}`);
  if (data.tier               !== undefined) ops.push(sql`UPDATE subscriptions SET tier = ${data.tier}, updated_at = NOW() WHERE id = ${id}`);
  if (data.mrr                !== undefined) ops.push(sql`UPDATE subscriptions SET mrr = ${data.mrr}, arr = ${(data.mrr ?? 0) * 12}, updated_at = NOW() WHERE id = ${id}`);
  if (data.currentPeriodEnd   !== undefined) ops.push(sql`UPDATE subscriptions SET current_period_end = ${data.currentPeriodEnd}, updated_at = NOW() WHERE id = ${id}`);
  if (data.cancelledAt        !== undefined) ops.push(sql`UPDATE subscriptions SET cancelled_at = ${data.cancelledAt}, updated_at = NOW() WHERE id = ${id}`);
  if (data.notes              !== undefined) ops.push(sql`UPDATE subscriptions SET notes = ${data.notes}, updated_at = NOW() WHERE id = ${id}`);
  await Promise.all(ops);
}

export async function getUpcomingRenewals(days = 30): Promise<DbSubscription[]> {
  return cast<DbSubscription>(sql`
    SELECT s.id, s.client_id, c.company_name AS client_name,
           s.stripe_customer_id, s.stripe_subscription_id,
           s.plan_id, s.plan_name, s.tier, s.status,
           s.current_period_start::text AS current_period_start,
           s.current_period_end::text AS current_period_end,
           s.trial_end::text AS trial_end,
           s.cancel_at::text AS cancel_at, s.cancelled_at::text AS cancelled_at,
           s.mrr::float AS mrr, s.arr::float AS arr, s.notes,
           s.created_at::text AS created_at, s.updated_at::text AS updated_at
    FROM subscriptions s JOIN clients c ON c.id = s.client_id
    WHERE s.status IN ('Active','Trial')
      AND s.current_period_end IS NOT NULL
      AND s.current_period_end <= NOW() + (${days} || ' days')::INTERVAL
    ORDER BY s.current_period_end ASC
  `);
}

// ─── Phase 10: Billing Payments (extended) ────────────────────────────────────

export function getBillingPayments(clientId?: number, limit = 100): Promise<DbBillingPayment[]> {
  if (clientId) {
    return cast<DbBillingPayment>(sql`
      SELECT p.id, p.invoice_id, inv.invoice_number,
             p.client_id, c.company_name AS client_name,
             p.amount::float AS amount,
             to_char(p.payment_date, 'Mon DD, YYYY') AS payment_date,
             p.method, p.reference, p.notes,
             COALESCE(p.stripe_payment_intent_id, NULL) AS stripe_payment_intent_id,
             COALESCE(p.stripe_charge_id, NULL)         AS stripe_charge_id,
             COALESCE(p.currency, 'usd')                AS currency,
             COALESCE(p.billing_status, 'Paid')         AS billing_status,
             p.created_at::text AS created_at
      FROM payments p
      LEFT JOIN invoices inv ON inv.id = p.invoice_id
      LEFT JOIN clients c ON c.id = p.client_id
      WHERE p.client_id = ${clientId}
      ORDER BY p.payment_date DESC LIMIT ${limit}
    `);
  }
  return cast<DbBillingPayment>(sql`
    SELECT p.id, p.invoice_id, inv.invoice_number,
           p.client_id, c.company_name AS client_name,
           p.amount::float AS amount,
           to_char(p.payment_date, 'Mon DD, YYYY') AS payment_date,
           p.method, p.reference, p.notes,
           COALESCE(p.stripe_payment_intent_id, NULL) AS stripe_payment_intent_id,
           COALESCE(p.stripe_charge_id, NULL)         AS stripe_charge_id,
           COALESCE(p.currency, 'usd')                AS currency,
           COALESCE(p.billing_status, 'Paid')         AS billing_status,
           p.created_at::text AS created_at
    FROM payments p
    LEFT JOIN invoices inv ON inv.id = p.invoice_id
    LEFT JOIN clients c ON c.id = p.client_id
    ORDER BY p.payment_date DESC LIMIT ${limit}
  `);
}

export async function createBillingPayment(data: {
  clientId?: number | null; invoiceId?: number | null;
  amount: number; method: string; paymentDate: string;
  reference?: string | null; notes?: string | null;
  stripePaymentIntentId?: string | null; stripeChargeId?: string | null;
  currency?: string; billingStatus?: string;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO payments
      (client_id, invoice_id, amount, method, payment_date, reference, notes,
       stripe_payment_intent_id, stripe_charge_id, currency, billing_status)
    VALUES
      (${data.clientId ?? null}, ${data.invoiceId ?? null},
       ${data.amount}, ${data.method}, ${data.paymentDate},
       ${data.reference ?? null}, ${data.notes ?? null},
       ${data.stripePaymentIntentId ?? null}, ${data.stripeChargeId ?? null},
       ${data.currency ?? 'usd'}, ${data.billingStatus ?? 'Paid'})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

// ─── Phase 10: Refunds ────────────────────────────────────────────────────────

export function getRefunds(clientId?: number, limit = 100): Promise<DbRefund[]> {
  if (clientId) {
    return cast<DbRefund>(sql`
      SELECT r.id, r.payment_id, r.client_id, c.company_name AS client_name,
             r.stripe_refund_id, r.amount::float AS amount, r.currency,
             r.reason, r.status, r.processed_by, r.notes,
             r.created_at::text AS created_at
      FROM refunds r
      LEFT JOIN clients c ON c.id = r.client_id
      WHERE r.client_id = ${clientId}
      ORDER BY r.created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbRefund>(sql`
    SELECT r.id, r.payment_id, r.client_id, c.company_name AS client_name,
           r.stripe_refund_id, r.amount::float AS amount, r.currency,
           r.reason, r.status, r.processed_by, r.notes,
           r.created_at::text AS created_at
    FROM refunds r
    LEFT JOIN clients c ON c.id = r.client_id
    ORDER BY r.created_at DESC LIMIT ${limit}
  `);
}

export async function createRefund(data: {
  paymentId?: number | null; clientId?: number | null; amount: number;
  currency?: string; reason?: string | null; processedBy?: string | null; notes?: string | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO refunds (payment_id, client_id, amount, currency, reason, processed_by, notes)
    VALUES (${data.paymentId ?? null}, ${data.clientId ?? null}, ${data.amount},
            ${data.currency ?? 'usd'}, ${data.reason ?? null},
            ${data.processedBy ?? null}, ${data.notes ?? null})
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0];
}

export async function updateRefundStatus(id: number, status: string, stripeRefundId?: string | null): Promise<void> {
  await sql`
    UPDATE refunds SET status = ${status},
      stripe_refund_id = COALESCE(${stripeRefundId ?? null}, stripe_refund_id)
    WHERE id = ${id}
  `;
}

// ─── Phase 10: Billing Events ─────────────────────────────────────────────────

export function getBillingEvents(limit = 50): Promise<DbBillingEvent[]> {
  return cast<DbBillingEvent>(sql`
    SELECT id, stripe_event_id, event_type, payload, processed, error_message,
           created_at::text AS created_at
    FROM billing_events ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function createBillingEvent(data: {
  stripeEventId?: string | null; eventType: string; payload?: string | null;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO billing_events (stripe_event_id, event_type, payload)
    VALUES (${data.stripeEventId ?? null}, ${data.eventType}, ${data.payload ?? null})
    ON CONFLICT (stripe_event_id) DO NOTHING
    RETURNING id
  ` as unknown as { id: number }[];
  return rows[0] ?? { id: 0 };
}

export async function markBillingEventProcessed(id: number, errorMessage?: string | null): Promise<void> {
  await sql`
    UPDATE billing_events SET processed = TRUE, error_message = ${errorMessage ?? null}
    WHERE id = ${id}
  `;
}

// ─── Phase 10: Plan Changes ───────────────────────────────────────────────────

export function getPlanChanges(clientId?: number, limit = 50): Promise<DbPlanChange[]> {
  if (clientId) {
    return cast<DbPlanChange>(sql`
      SELECT pc.id, pc.client_id, c.company_name AS client_name,
             pc.subscription_id, pc.from_plan_id, pc.to_plan_id,
             pc.from_tier, pc.to_tier, pc.change_type,
             to_char(pc.effective_date, 'Mon DD, YYYY') AS effective_date,
             pc.reason, pc.revenue_impact::float AS revenue_impact, pc.created_by,
             pc.created_at::text AS created_at
      FROM plan_changes pc JOIN clients c ON c.id = pc.client_id
      WHERE pc.client_id = ${clientId}
      ORDER BY pc.created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbPlanChange>(sql`
    SELECT pc.id, pc.client_id, c.company_name AS client_name,
           pc.subscription_id, pc.from_plan_id, pc.to_plan_id,
           pc.from_tier, pc.to_tier, pc.change_type,
           to_char(pc.effective_date, 'Mon DD, YYYY') AS effective_date,
           pc.reason, pc.revenue_impact::float AS revenue_impact, pc.created_by,
           pc.created_at::text AS created_at
    FROM plan_changes pc JOIN clients c ON c.id = pc.client_id
    ORDER BY pc.created_at DESC LIMIT ${limit}
  `);
}

export async function createPlanChange(data: {
  clientId: number; subscriptionId?: number | null;
  fromPlanId?: number | null; toPlanId?: number | null;
  fromTier?: string | null; toTier?: string | null;
  changeType?: string; effectiveDate?: string | null;
  reason?: string | null; revenueImpact?: number | null; createdBy?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO plan_changes
      (client_id, subscription_id, from_plan_id, to_plan_id, from_tier, to_tier,
       change_type, effective_date, reason, revenue_impact, created_by)
    VALUES
      (${data.clientId}, ${data.subscriptionId ?? null},
       ${data.fromPlanId ?? null}, ${data.toPlanId ?? null},
       ${data.fromTier ?? null}, ${data.toTier ?? null},
       ${data.changeType ?? 'upgrade'}, ${data.effectiveDate ?? null},
       ${data.reason ?? null}, ${data.revenueImpact ?? null}, ${data.createdBy ?? null})
  `;
}

// ─── Phase 10: Billing Renewal History ───────────────────────────────────────

export function getBillingRenewalHistory(clientId?: number, limit = 50): Promise<DbBillingRenewal[]> {
  if (clientId) {
    return cast<DbBillingRenewal>(sql`
      SELECT brh.id, brh.client_id, c.company_name AS client_name,
             brh.subscription_id,
             to_char(brh.renewal_date, 'Mon DD, YYYY') AS renewal_date,
             brh.status, brh.amount::float AS amount, brh.stripe_invoice_id, brh.notes,
             brh.created_at::text AS created_at
      FROM billing_renewal_history brh JOIN clients c ON c.id = brh.client_id
      WHERE brh.client_id = ${clientId}
      ORDER BY brh.renewal_date DESC LIMIT ${limit}
    `);
  }
  return cast<DbBillingRenewal>(sql`
    SELECT brh.id, brh.client_id, c.company_name AS client_name,
           brh.subscription_id,
           to_char(brh.renewal_date, 'Mon DD, YYYY') AS renewal_date,
           brh.status, brh.amount::float AS amount, brh.stripe_invoice_id, brh.notes,
           brh.created_at::text AS created_at
    FROM billing_renewal_history brh JOIN clients c ON c.id = brh.client_id
    ORDER BY brh.renewal_date DESC LIMIT ${limit}
  `);
}

export async function createBillingRenewal(data: {
  clientId: number; subscriptionId?: number | null; renewalDate: string;
  status?: string; amount?: number | null; stripeInvoiceId?: string | null; notes?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO billing_renewal_history
      (client_id, subscription_id, renewal_date, status, amount, stripe_invoice_id, notes)
    VALUES
      (${data.clientId}, ${data.subscriptionId ?? null}, ${data.renewalDate},
       ${data.status ?? 'Renewed'}, ${data.amount ?? null},
       ${data.stripeInvoiceId ?? null}, ${data.notes ?? null})
  `;
}

// ─── Phase 10: Billing Metrics ────────────────────────────────────────────────

export async function getBillingMetrics(): Promise<{
  mrr: number; arr: number; activeSubscriptions: number;
  trialSubscriptions: number; pastDue: number; cancelled: number;
  upcomingRenewals30d: number; failedPayments: number;
  totalRevenue: number; revenueByTier: Record<string, number>;
}> {
  const [subStats, payStats, tierStats] = await Promise.all([
    sql`
      SELECT
        SUM(CASE WHEN status = 'Active' THEN mrr ELSE 0 END)    AS mrr,
        COUNT(CASE WHEN status = 'Active' THEN 1 END)           AS active,
        COUNT(CASE WHEN status = 'Trial' THEN 1 END)            AS trial,
        COUNT(CASE WHEN status = 'Past Due' THEN 1 END)         AS past_due,
        COUNT(CASE WHEN status IN ('Cancelled','Expired') THEN 1 END) AS cancelled,
        COUNT(CASE WHEN status IN ('Active','Trial') AND current_period_end <= NOW() + INTERVAL '30 days' THEN 1 END) AS renewing_soon
      FROM subscriptions
    ` as Promise<any[]>,
    sql`
      SELECT
        COALESCE(SUM(CASE WHEN COALESCE(billing_status,'Paid') = 'Paid' THEN amount ELSE 0 END), 0) AS total_revenue,
        COUNT(CASE WHEN COALESCE(billing_status,'Paid') = 'Failed' THEN 1 END)                       AS failed
      FROM payments
    ` as Promise<any[]>,
    sql`
      SELECT tier, COALESCE(SUM(mrr), 0) AS tier_mrr
      FROM subscriptions WHERE status = 'Active' AND tier IS NOT NULL
      GROUP BY tier
    ` as Promise<any[]>,
  ]);
  const s = (subStats as any[])[0];
  const p = (payStats as any[])[0];
  const mrr = Number(s?.mrr ?? 0);
  const revenueByTier = Object.fromEntries((tierStats as any[]).map(r => [r.tier, Number(r.tier_mrr ?? 0)]));
  return {
    mrr,
    arr:                   mrr * 12,
    activeSubscriptions:   Number(s?.active       ?? 0),
    trialSubscriptions:    Number(s?.trial        ?? 0),
    pastDue:               Number(s?.past_due     ?? 0),
    cancelled:             Number(s?.cancelled    ?? 0),
    upcomingRenewals30d:   Number(s?.renewing_soon ?? 0),
    failedPayments:        Number(p?.failed        ?? 0),
    totalRevenue:          Number(p?.total_revenue ?? 0),
    revenueByTier,
  };
}

// ─── Phase 11: Audit Logs ─────────────────────────────────────────────────────

export async function createAuditLog(data: {
  action: string;
  actorId?: number | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  targetType?: string | null;
  targetId?: number | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO audit_logs (action, actor_id, actor_email, actor_role, target_type, target_id, details, ip_address)
    VALUES (${data.action}, ${data.actorId ?? null}, ${data.actorEmail ?? null}, ${data.actorRole ?? null},
            ${data.targetType ?? null}, ${data.targetId ?? null},
            ${data.details ? JSON.stringify(data.details) : null}::jsonb,
            ${data.ipAddress ?? null})
  `;
}

export function getAuditLogs(limit = 100, action?: string): Promise<DbAuditLog[]> {
  if (action) {
    return cast<DbAuditLog>(sql`
      SELECT id, action, actor_id, actor_email, actor_role, target_type, target_id,
             details, ip_address, created_at::text AS created_at
      FROM audit_logs WHERE action = ${action}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbAuditLog>(sql`
    SELECT id, action, actor_id, actor_email, actor_role, target_type, target_id,
           details, ip_address, created_at::text AS created_at
    FROM audit_logs ORDER BY created_at DESC LIMIT ${limit}
  `);
}

// ─── Phase 11: Error Logs ─────────────────────────────────────────────────────

export async function createErrorLog(data: {
  errorType: string;
  message: string;
  stack?: string | null;
  context?: Record<string, unknown> | null;
}): Promise<void> {
  await sql`
    INSERT INTO error_logs (error_type, message, stack, context)
    VALUES (${data.errorType}, ${data.message}, ${data.stack ?? null},
            ${data.context ? JSON.stringify(data.context) : null}::jsonb)
  `;
}

export function getErrorLogs(limit = 50, unresolvedOnly = false): Promise<DbErrorLog[]> {
  if (unresolvedOnly) {
    return cast<DbErrorLog>(sql`
      SELECT id, error_type, message, stack, context, resolved,
             resolved_at::text AS resolved_at, created_at::text AS created_at
      FROM error_logs WHERE resolved = FALSE
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }
  return cast<DbErrorLog>(sql`
    SELECT id, error_type, message, stack, context, resolved,
           resolved_at::text AS resolved_at, created_at::text AS created_at
    FROM error_logs ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function resolveErrorLog(id: number): Promise<void> {
  await sql`UPDATE error_logs SET resolved = TRUE, resolved_at = NOW() WHERE id = ${id}`;
}

// ─── Phase 11: Health Checks ──────────────────────────────────────────────────

export async function createHealthCheckResult(data: {
  service: string;
  status: string;
  message?: string | null;
  responseTimeMs?: number | null;
}): Promise<void> {
  await sql`
    INSERT INTO health_check_results (service, status, message, response_time_ms)
    VALUES (${data.service}, ${data.status}, ${data.message ?? null}, ${data.responseTimeMs ?? null})
  `;
}

export async function getLatestHealthChecks(): Promise<DbHealthCheckResult[]> {
  return cast<DbHealthCheckResult>(sql`
    SELECT DISTINCT ON (service) id, service, status, message,
           response_time_ms, checked_at::text AS checked_at
    FROM health_check_results
    ORDER BY service, checked_at DESC
  `);
}

export function getHealthCheckHistory(service: string, limit = 24): Promise<DbHealthCheckResult[]> {
  return cast<DbHealthCheckResult>(sql`
    SELECT id, service, status, message, response_time_ms, checked_at::text AS checked_at
    FROM health_check_results WHERE service = ${service}
    ORDER BY checked_at DESC LIMIT ${limit}
  `);
}

// ─── Phase 12: SOPs ───────────────────────────────────────────────────────────

export function getSops(includeArchived = false): Promise<DbSop[]> {
  if (includeArchived) {
    return cast<DbSop>(sql`
      SELECT id, title, category, content, status, version, created_by,
             created_at::text AS created_at, updated_at::text AS updated_at
      FROM sops ORDER BY category ASC, title ASC
    `);
  }
  return cast<DbSop>(sql`
    SELECT id, title, category, content, status, version, created_by,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM sops WHERE status = 'Active' ORDER BY category ASC, title ASC
  `);
}

export async function getSopById(id: number): Promise<DbSop | null> {
  const rows = await cast<DbSop>(sql`
    SELECT id, title, category, content, status, version, created_by,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM sops WHERE id = ${id}
  `);
  return rows[0] ?? null;
}

// ─── Phase 12: Docs ───────────────────────────────────────────────────────────

export function getDocs(includeArchived = false): Promise<DbDocPage[]> {
  if (includeArchived) {
    return cast<DbDocPage>(sql`
      SELECT id, title, category, content, status, created_by,
             created_at::text AS created_at, updated_at::text AS updated_at
      FROM docs_pages ORDER BY category ASC, title ASC
    `);
  }
  return cast<DbDocPage>(sql`
    SELECT id, title, category, content, status, created_by,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM docs_pages WHERE status = 'Active' ORDER BY category ASC, title ASC
  `);
}

export async function getDocById(id: number): Promise<DbDocPage | null> {
  const rows = await cast<DbDocPage>(sql`
    SELECT id, title, category, content, status, created_by,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM docs_pages WHERE id = ${id}
  `);
  return rows[0] ?? null;
}

// ─── Phase 12: Test Cases ─────────────────────────────────────────────────────

export function getTestCases(): Promise<DbTestCase[]> {
  return cast<DbTestCase>(sql`
    SELECT id, feature, description, category, status, owner, notes,
           last_tested_at::text AS last_tested_at,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM test_cases ORDER BY category ASC, feature ASC
  `);
}

// ─── Phase 12: Support Tickets ────────────────────────────────────────────────

export function getSupportTickets(statusFilter?: string): Promise<DbSupportTicket[]> {
  if (statusFilter) {
    return cast<DbSupportTicket>(sql`
      SELECT t.id, t.title, t.description, t.status, t.priority,
             t.client_id, c.company_name AS client_name,
             t.assigned_to, t.resolution_notes,
             t.resolved_at::text AS resolved_at,
             t.created_at::text AS created_at, t.updated_at::text AS updated_at
      FROM support_tickets t
      LEFT JOIN clients c ON c.id = t.client_id
      WHERE t.status = ${statusFilter}
      ORDER BY
        CASE t.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
        t.created_at DESC
    `);
  }
  return cast<DbSupportTicket>(sql`
    SELECT t.id, t.title, t.description, t.status, t.priority,
           t.client_id, c.company_name AS client_name,
           t.assigned_to, t.resolution_notes,
           t.resolved_at::text AS resolved_at,
           t.created_at::text AS created_at, t.updated_at::text AS updated_at
    FROM support_tickets t
    LEFT JOIN clients c ON c.id = t.client_id
    ORDER BY
      CASE t.status WHEN 'Open' THEN 1 WHEN 'In Progress' THEN 2 ELSE 3 END,
      CASE t.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
      t.created_at DESC
  `);
}

// ─── Phase 12: Offboarding ────────────────────────────────────────────────────

export function getOffboardingRecords(): Promise<DbOffboardingRecord[]> {
  return cast<DbOffboardingRecord>(sql`
    SELECT id, client_id, client_name, reason,
           offboarding_date::text AS offboarding_date,
           data_exported, access_disabled, archived, notes, created_by,
           created_at::text AS created_at
    FROM offboarding_records ORDER BY created_at DESC
  `);
}

export async function createOffboardingRecord(data: {
  clientId: number; clientName?: string | null; reason?: string | null;
  offboardingDate?: string | null; createdBy?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO offboarding_records (client_id, client_name, reason, offboarding_date, created_by)
    VALUES (${data.clientId}, ${data.clientName ?? null}, ${data.reason ?? null},
            ${data.offboardingDate ?? null}, ${data.createdBy ?? null})
  `;
}

// ─── Phase 12: Client Templates ───────────────────────────────────────────────

export function getClientTemplates(): Promise<DbClientTemplate[]> {
  return cast<DbClientTemplate>(sql`
    SELECT id, name, tier, description, default_status,
           COALESCE(features, '{}') AS features, is_default,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM client_templates ORDER BY
      CASE tier WHEN 'Silver' THEN 1 WHEN 'Gold' THEN 2 ELSE 3 END
  `);
}

// ─── Phase 13: Payment Providers ─────────────────────────────────────────────

export function getPaymentProviders(): Promise<DbPaymentProvider[]> {
  return cast<DbPaymentProvider>(sql`
    SELECT id, name, display_name, status, enabled, sandbox_mode,
           api_configured, is_default,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM payment_providers ORDER BY id
  `);
}

export async function getDefaultProvider(): Promise<DbPaymentProvider | null> {
  const rows = await cast<DbPaymentProvider>(sql`
    SELECT id, name, display_name, status, enabled, sandbox_mode,
           api_configured, is_default,
           created_at::text AS created_at, updated_at::text AS updated_at
    FROM payment_providers WHERE is_default = true AND enabled = true LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function setDefaultProvider(name: string): Promise<void> {
  await sql`UPDATE payment_providers SET is_default = false, updated_at = NOW()`;
  await sql`UPDATE payment_providers SET is_default = true,  updated_at = NOW() WHERE name = ${name}`;
}

export async function toggleProviderEnabled(id: number, enabled: boolean): Promise<void> {
  await sql`UPDATE payment_providers SET enabled = ${enabled}, updated_at = NOW() WHERE id = ${id}`;
}
