"use server";

import { revalidatePath } from "next/cache";
import { verifyOwnerSession } from "./dal";
import { sql } from "./db";

export async function updateTestCaseAction(
  id: number,
  status: "Pass" | "Fail" | "Needs Review",
  notes?: string
): Promise<void> {
  await verifyOwnerSession();
  await sql`
    UPDATE test_cases
    SET status = ${status},
        notes = COALESCE(${notes ?? null}, notes),
        last_tested_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
  `;
  revalidatePath("/admin/testing");
  revalidatePath("/admin/launch");
}
