"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import { sql } from "./db";

const DocSchema = z.object({
  title:    z.string().min(1, "Title required"),
  category: z.string().min(1, "Category required"),
  content:  z.string().optional(),
});

export type DocState = { error?: string; success?: boolean } | null;

export async function createDocAction(
  _prev: DocState,
  formData: FormData
): Promise<DocState> {
  try {
    const session = await verifyOwnerSession();
    const parsed = DocSchema.safeParse({
      title:    formData.get("title"),
      category: formData.get("category"),
      content:  formData.get("content") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await sql`
      INSERT INTO docs_pages (title, category, content, created_by)
      VALUES (${parsed.data.title}, ${parsed.data.category},
              ${parsed.data.content ?? null}, ${session.name})
    `;
    revalidatePath("/admin/docs");
    return { success: true };
  } catch {
    return { error: "Failed to create doc" };
  }
}

export async function updateDocAction(
  id: number,
  _prev: DocState,
  formData: FormData
): Promise<DocState> {
  try {
    await verifyOwnerSession();
    const parsed = DocSchema.safeParse({
      title:    formData.get("title"),
      category: formData.get("category"),
      content:  formData.get("content") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await sql`
      UPDATE docs_pages
      SET title = ${parsed.data.title}, category = ${parsed.data.category},
          content = ${parsed.data.content ?? null}, updated_at = NOW()
      WHERE id = ${id}
    `;
    revalidatePath("/admin/docs");
    return { success: true };
  } catch {
    return { error: "Failed to update doc" };
  }
}

export async function setDocStatusAction(id: number, status: "Active" | "Archived"): Promise<void> {
  await verifyOwnerSession();
  await sql`UPDATE docs_pages SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/admin/docs");
}
