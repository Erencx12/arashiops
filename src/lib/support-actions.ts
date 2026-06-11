"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import { sql } from "./db";
import { writeAuditLog } from "./audit";

const TicketSchema = z.object({
  title:       z.string().min(1, "Title required"),
  description: z.string().optional(),
  priority:    z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  clientId:    z.string().optional(),
  assignedTo:  z.string().optional(),
});

export type TicketState = { error?: string; success?: boolean } | null;

// ─── Create Ticket ────────────────────────────────────────────────────────────

export async function createTicketAction(
  _prev: TicketState,
  formData: FormData
): Promise<TicketState> {
  try {
    const session = await verifyOwnerSession();
    const parsed = TicketSchema.safeParse({
      title:       formData.get("title"),
      description: formData.get("description") || undefined,
      priority:    formData.get("priority") || "Medium",
      clientId:    formData.get("clientId") || undefined,
      assignedTo:  formData.get("assignedTo") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const clientId = parsed.data.clientId ? Number(parsed.data.clientId) : null;
    await sql`
      INSERT INTO support_tickets (title, description, priority, client_id, assigned_to)
      VALUES (${parsed.data.title}, ${parsed.data.description ?? null},
              ${parsed.data.priority}, ${clientId},
              ${parsed.data.assignedTo ?? session.name})
    `;
    revalidatePath("/admin/support");
    return { success: true };
  } catch {
    return { error: "Failed to create ticket" };
  }
}

// ─── Update Ticket Status ─────────────────────────────────────────────────────

export async function updateTicketStatusAction(
  id: number,
  status: string,
  resolutionNotes?: string
): Promise<void> {
  await verifyOwnerSession();
  const resolvedAt = status === "Resolved" || status === "Closed" ? new Date().toISOString() : null;
  await sql`
    UPDATE support_tickets
    SET status = ${status},
        resolution_notes = COALESCE(${resolutionNotes ?? null}, resolution_notes),
        resolved_at = COALESCE(${resolvedAt}, resolved_at),
        updated_at = NOW()
    WHERE id = ${id}
  `;
  if (status === "Resolved") {
    void writeAuditLog({ action: "settings.changed", details: { entity: "support_ticket", id, newStatus: status } });
  }
  revalidatePath("/admin/support");
}

// ─── Resolve Ticket ───────────────────────────────────────────────────────────

export async function resolveTicketAction(
  _prev: TicketState,
  formData: FormData
): Promise<TicketState> {
  try {
    await verifyOwnerSession();
    const id = Number(formData.get("id"));
    const notes = formData.get("notes") as string | null;
    if (!id) return { error: "Ticket ID required" };

    await sql`
      UPDATE support_tickets
      SET status = 'Resolved', resolution_notes = ${notes ?? null},
          resolved_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;
    revalidatePath("/admin/support");
    return { success: true };
  } catch {
    return { error: "Failed to resolve ticket" };
  }
}
