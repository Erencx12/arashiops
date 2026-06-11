"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyOwnerSession, verifyClientSession } from "./dal";
import {
  updateClientTier, updateClientStatus, updateClientInfo,
  createClientNote, deleteClientNote,
  createNotification,
} from "./queries";
import { sql } from "./db";
import { writeAuditLog } from "./audit";

// ─── Update tier ──────────────────────────────────────────────────────────────

export async function updateClientTierAction(
  clientId: number,
  tier: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifyOwnerSession();
    if (!session) return { ok: false, error: "Unauthorized." };

    await updateClientTier(clientId, tier);
    void writeAuditLog({ action: "client.tier_changed", targetType: "client", targetId: clientId, details: { newTier: tier } });
    await createNotification({
      type: "tier_upgraded",
      title: "Tier Updated",
      message: `Client #${clientId} tier changed to ${tier}.`,
      clientId,
    });
    await sql`
      INSERT INTO activity_log (type, description)
      VALUES ('client', ${`Client #${clientId} tier changed to ${tier}`})
    `;

    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong." };
  }
}

// ─── Update status (suspend, reactivate, archive) ─────────────────────────────

export async function updateClientStatusAction(
  clientId: number,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await verifyOwnerSession();
    if (!session) return { ok: false, error: "Unauthorized." };

    await updateClientStatus(clientId, status);
    void writeAuditLog({ action: "client.status_changed", targetType: "client", targetId: clientId, details: { newStatus: status } });
    await sql`
      INSERT INTO activity_log (type, description)
      VALUES ('client', ${`Client #${clientId} status changed to ${status}`})
    `;

    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong." };
  }
}

// ─── Update company info ──────────────────────────────────────────────────────

const UpdateInfoSchema = z.object({
  contact_name:    z.string().min(1).optional(),
  email:           z.string().email().optional(),
  monthly_value:   z.string().refine((v) => !v || !isNaN(Number(v))).optional(),
  industry:        z.string().optional(),
  internal_notes:  z.string().optional(),
  contract_status: z.string().optional(),
});

export type UpdateClientInfoState = {
  error?: string;
  success?: boolean;
} | null;

export async function updateClientInfoAction(
  clientId: number,
  _prev: UpdateClientInfoState,
  formData: FormData
): Promise<UpdateClientInfoState> {
  try {
    await verifyOwnerSession();

    const parsed = UpdateInfoSchema.safeParse({
      contact_name:    formData.get("contact_name") || undefined,
      email:           formData.get("email") || undefined,
      monthly_value:   formData.get("monthly_value") || undefined,
      industry:        formData.get("industry") || undefined,
      internal_notes:  formData.get("internal_notes") || undefined,
      contract_status: formData.get("contract_status") || undefined,
    });

    if (!parsed.success) {
      return { error: "Invalid data. Check all fields." };
    }

    await updateClientInfo(clientId, {
      ...parsed.data,
      monthly_value: parsed.data.monthly_value ? Number(parsed.data.monthly_value) : undefined,
    });

    revalidatePath(`/admin/clients/${clientId}`);
    return { success: true };
  } catch {
    return { error: "Something went wrong." };
  }
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function addClientNoteAction(
  clientId: number,
  content: string,
  isInternal: boolean
): Promise<{ ok: boolean }> {
  try {
    const session = await verifyOwnerSession();
    await createClientNote(clientId, content, isInternal, session.name);
    revalidatePath(`/admin/clients/${clientId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteClientNoteAction(
  noteId: number,
  clientId: number
): Promise<{ ok: boolean }> {
  try {
    await verifyOwnerSession();
    await deleteClientNote(noteId);
    revalidatePath(`/admin/clients/${clientId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ─── Client self-service: save profile ───────────────────────────────────────

const ClientProfileSchema = z.object({
  contact_name: z.string().min(1, "Name is required"),
  email:        z.string().email("Valid email required"),
});

export async function saveClientProfileAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const session = await verifyClientSession();
    const parsed = ClientProfileSchema.safeParse({
      contact_name: formData.get("contact_name"),
      email:        formData.get("email"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await updateClientInfo(session.clientId, parsed.data);
    revalidatePath("/client/settings");
    return { success: true };
  } catch {
    return { error: "Failed to save changes." };
  }
}
