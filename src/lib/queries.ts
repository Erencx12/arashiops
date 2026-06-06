import { sql } from "./db";
import type {
  DbClient, DbProject, DbAgentTask, DbApproval, DbContentItem,
  DbMeeting, DbContract, DbInvoice, DbLead, DbMrrHistory,
  DbSalesFunnel, DbActivity,
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
           created_at
    FROM clients
    ORDER BY created_at ASC
  `);
}

export async function getClientById(id: number): Promise<DbClient | null> {
  const rows = await cast<DbClient>(sql`
    SELECT id, company_name, contact_name, email, tier, status,
           monthly_value, industry, owner, health_score,
           to_char(renewal_date, 'Mon YYYY') AS renewal_date,
           to_char(start_date, 'Mon YYYY') AS start_date,
           created_at
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
           created_at
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
           p.agent
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    ORDER BY p.created_at ASC
  `);
}

export function getProjectsByClient(clientId: number): Promise<DbProject[]> {
  return cast<DbProject>(sql`
    SELECT p.id, p.client_id, c.company_name AS client_name, p.title,
           p.status, p.progress, p.start_date,
           to_char(p.deadline, 'Mon DD, YYYY') AS deadline,
           p.agent
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.client_id = ${clientId}
    ORDER BY p.created_at ASC
  `);
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
           a.agent, a.status, a.comment,
           to_char(a.created_at, 'Mon DD, YYYY') AS created_at
    FROM approvals a
    JOIN clients c ON c.id = a.client_id
    ORDER BY a.created_at DESC
  `);
}

export function getApprovalsByClient(clientId: number): Promise<DbApproval[]> {
  return cast<DbApproval>(sql`
    SELECT a.id, a.type, a.title, a.client_id, c.company_name AS client_name,
           a.agent, a.status, a.comment,
           to_char(a.created_at, 'Mon DD, YYYY') AS created_at
    FROM approvals a
    JOIN clients c ON c.id = a.client_id
    WHERE a.client_id = ${clientId}
    ORDER BY a.created_at DESC
  `);
}

// ─── Content Items ────────────────────────────────────────────────────────────

export function getContentItems(): Promise<DbContentItem[]> {
  return cast<DbContentItem>(sql`
    SELECT ci.id, ci.client_id, c.company_name AS client_name, ci.type,
           ci.title, ci.size_label, ci.tags,
           to_char(ci.created_at, 'Mon DD, YYYY') AS created_at
    FROM content_items ci
    JOIN clients c ON c.id = ci.client_id
    ORDER BY ci.created_at DESC
  `);
}

export function getContentItemsByClient(clientId: number): Promise<DbContentItem[]> {
  return cast<DbContentItem>(sql`
    SELECT ci.id, ci.client_id, c.company_name AS client_name, ci.type,
           ci.title, ci.size_label, ci.tags,
           to_char(ci.created_at, 'Mon DD, YYYY') AS created_at
    FROM content_items ci
    JOIN clients c ON c.id = ci.client_id
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
