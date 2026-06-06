"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";
import { verifySession } from "./dal";
import type { ApprovalStatus, ProjectStatus } from "./db-types";

export async function updateApprovalStatus(
  id: number,
  status: ApprovalStatus,
  comment?: string
) {
  await verifySession(); // must be authenticated
  await sql`
    UPDATE approvals
    SET status = ${status},
        comment = ${comment ?? null}
    WHERE id = ${id}
  `;
  await sql`
    INSERT INTO activity_log (type, description)
    VALUES ('approval', ${`Approval #${id} marked ${status}`})
  `;
  revalidatePath("/admin/approvals");
  revalidatePath("/client/approvals");
  revalidatePath("/admin");
}

export async function updateProjectStatus(id: number, status: ProjectStatus) {
  const session = await verifySession();
  if (session.role !== "owner") return;
  await sql`
    UPDATE projects SET status = ${status} WHERE id = ${id}
  `;
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
}

export async function updateProjectProgress(id: number, progress: number) {
  const session = await verifySession();
  if (session.role !== "owner") return;
  await sql`
    UPDATE projects SET progress = ${progress} WHERE id = ${id}
  `;
  revalidatePath("/admin/projects");
}
