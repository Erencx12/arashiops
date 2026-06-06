import { sql } from "./db";
import type {
  DbClient, DbProject, DbAgentTask, DbApproval, DbContentItem,
  DbMeeting, DbContract, DbInvoice, DbLead, DbMrrHistory,
  DbSalesFunnel, DbActivity, DbUser, DbInviteToken, DbPasswordResetToken,
  DbOnboardingForm, DbOnboardingProgress, DbProjectMilestone,
  DbTask, DbFile, DbNotification, DbClientNote,
  DbDeal, DbDiscoveryCall, DbProposal, DbPayment, DbRenewal,
} from "./db-types";

// Helper: Neon returns Record<string, any>[] — cast through unknown
function cast<T>(p: Promise<unknown>): Promise<T[]> {
  return p as Promise<T[]>;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

const CLIENT_COLS = sql`
  id, company_name, contact_name, email, tier, status,
  monthly_value, industry, owner, health_score,
  to_char(renewal_date, 'Mon YYYY') AS renewal_date,
  to_char(start_date, 'Mon YYYY') AS start_date,
  created_at,
  COALESCE(tags, '{}') AS tags,
  contract_status,
  internal_notes
`;

export function getClients(): Promise<DbClient[]> {
  return cast<DbClient>(sql`SELECT ${CLIENT_COLS} FROM clients ORDER BY created_at ASC`);
}

export async function getClientById(id: number): Promise<DbClient | null> {
  const rows = await cast<DbClient>(sql`SELECT ${CLIENT_COLS} FROM clients WHERE id = ${id}`);
  return rows[0] ?? null;
}

export async function getClientByName(name: string): Promise<DbClient | null> {
  const rows = await cast<DbClient>(sql`SELECT ${CLIENT_COLS} FROM clients WHERE company_name = ${name}`);
  return rows[0] ?? null;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

const PROJECT_COLS = sql`
  p.id, p.client_id, c.company_name AS client_name, p.title,
  p.status, p.progress, p.start_date,
  to_char(p.deadline, 'Mon DD, YYYY') AS deadline,
  p.agent,
  COALESCE(p.priority, 'Medium') AS priority,
  p.description,
  p.assigned_owner
`;

export function getProjects(): Promise<DbProject[]> {
  return cast<DbProject>(sql`
    SELECT ${PROJECT_COLS}
    FROM projects p JOIN clients c ON c.id = p.client_id
    ORDER BY p.created_at ASC
  `);
}

export function getProjectsByClient(clientId: number): Promise<DbProject[]> {
  return cast<DbProject>(sql`
    SELECT ${PROJECT_COLS}
    FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE p.client_id = ${clientId}
    ORDER BY p.created_at ASC
  `);
}

export async function getProjectById(id: number): Promise<DbProject | null> {
  const rows = await cast<DbProject>(sql`
    SELECT ${PROJECT_COLS}
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

const APPROVAL_COLS = sql`
  a.id, a.type, a.title, a.client_id, c.company_name AS client_name,
  a.agent, a.status, a.comment,
  COALESCE(a.client_comment, NULL) AS client_comment,
  COALESCE(a.deliverable_id, NULL) AS deliverable_id,
  to_char(a.created_at, 'Mon DD, YYYY') AS created_at
`;

export function getApprovals(): Promise<DbApproval[]> {
  return cast<DbApproval>(sql`
    SELECT ${APPROVAL_COLS}
    FROM approvals a JOIN clients c ON c.id = a.client_id
    ORDER BY a.created_at DESC
  `);
}

export function getApprovalsByClient(clientId: number): Promise<DbApproval[]> {
  return cast<DbApproval>(sql`
    SELECT ${APPROVAL_COLS}
    FROM approvals a JOIN clients c ON c.id = a.client_id
    WHERE a.client_id = ${clientId}
    ORDER BY a.created_at DESC
  `);
}

// ─── Content Items ────────────────────────────────────────────────────────────

const CONTENT_COLS = sql`
  ci.id, ci.client_id, c.company_name AS client_name, ci.type,
  ci.title, ci.size_label, COALESCE(ci.tags, '{}') AS tags,
  COALESCE(ci.status, 'Awaiting Approval') AS status,
  COALESCE(ci.version, '1.0') AS version,
  ci.project_id,
  to_char(ci.created_at, 'Mon DD, YYYY') AS created_at
`;

export function getContentItems(): Promise<DbContentItem[]> {
  return cast<DbContentItem>(sql`
    SELECT ${CONTENT_COLS}
    FROM content_items ci JOIN clients c ON c.id = ci.client_id
    ORDER BY ci.created_at DESC
  `);
}

export function getContentItemsByClient(clientId: number): Promise<DbContentItem[]> {
  return cast<DbContentItem>(sql`
    SELECT ${CONTENT_COLS}
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
           to_char(m.meeting_date, 'Mon DD, YYYY') AS meeting_date,
           m.meeting_time, m.status, m.notes, m.duration
    FROM meetings m
    LEFT JOIN clients c ON c.id = m.client_id
    ORDER BY m.meeting_date DESC
  `);
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

const TASK_COLS = sql`
  t.id, t.title, t.description, t.priority, t.status, t.assignee,
  t.client_id, c.company_name AS client_name,
  t.project_id, p.title AS project_title,
  to_char(t.due_date, 'Mon DD, YYYY') AS due_date,
  to_char(t.created_at, 'Mon DD, YYYY') AS created_at,
  completed_at::text AS completed_at
`;

export function getTasks(): Promise<DbTask[]> {
  return cast<DbTask>(sql`
    SELECT ${TASK_COLS}
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
    SELECT ${TASK_COLS}
    FROM tasks t
    LEFT JOIN clients c ON c.id = t.client_id
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE t.client_id = ${clientId}
    ORDER BY t.created_at DESC
  `);
}

export function getTasksByProject(projectId: number): Promise<DbTask[]> {
  return cast<DbTask>(sql`
    SELECT ${TASK_COLS}
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
