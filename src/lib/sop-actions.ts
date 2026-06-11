"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import { sql } from "./db";

// ─── Create SOP ───────────────────────────────────────────────────────────────

const SopSchema = z.object({
  title:    z.string().min(1, "Title required"),
  category: z.string().min(1, "Category required"),
  content:  z.string().optional(),
});

export type SopState = { error?: string; success?: boolean } | null;

export async function createSopAction(
  _prev: SopState,
  formData: FormData
): Promise<SopState> {
  try {
    const session = await verifyOwnerSession();
    const parsed = SopSchema.safeParse({
      title:    formData.get("title"),
      category: formData.get("category"),
      content:  formData.get("content") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await sql`
      INSERT INTO sops (title, category, content, created_by)
      VALUES (${parsed.data.title}, ${parsed.data.category},
              ${parsed.data.content ?? null}, ${session.name})
    `;
    revalidatePath("/admin/sops");
    return { success: true };
  } catch {
    return { error: "Failed to create SOP" };
  }
}

// ─── Update SOP ───────────────────────────────────────────────────────────────

export async function updateSopAction(
  id: number,
  _prev: SopState,
  formData: FormData
): Promise<SopState> {
  try {
    await verifyOwnerSession();
    const parsed = SopSchema.safeParse({
      title:    formData.get("title"),
      category: formData.get("category"),
      content:  formData.get("content") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await sql`
      UPDATE sops
      SET title = ${parsed.data.title}, category = ${parsed.data.category},
          content = ${parsed.data.content ?? null},
          version = version + 1, updated_at = NOW()
      WHERE id = ${id}
    `;
    revalidatePath("/admin/sops");
    return { success: true };
  } catch {
    return { error: "Failed to update SOP" };
  }
}

// ─── Archive / Restore SOP ────────────────────────────────────────────────────

export async function setSopStatusAction(id: number, status: "Active" | "Archived"): Promise<void> {
  await verifyOwnerSession();
  await sql`UPDATE sops SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/admin/sops");
}
