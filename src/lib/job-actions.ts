"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createJob, updateJobStatus, addSystemLog } from "./queries";

const JobSchema = z.object({
  name:      z.string().min(1, "Name required"),
  source:    z.string().optional(),
  queueType: z.string().optional(),
  payload:   z.string().optional(),
});

export async function createJobAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const parsed = JobSchema.safeParse({
    name:      formData.get("name"),
    source:    formData.get("source") || undefined,
    queueType: formData.get("queueType") || undefined,
    payload:   formData.get("payload") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { id } = await createJob(parsed.data);
    await addSystemLog({
      eventType: "system",
      level: "info",
      message: `Job created: ${parsed.data.name}`,
      module: "jobs",
      jobId: id,
    });
    revalidatePath("/admin/jobs");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create job" };
  }
}

export async function cancelJobAction(id: number): Promise<void> {
  await updateJobStatus(id, "Cancelled");
  await addSystemLog({
    eventType: "system",
    level: "warn",
    message: `Job cancelled (id: ${id})`,
    module: "jobs",
    jobId: id,
  });
  revalidatePath("/admin/jobs");
}

export async function retryJobAction(id: number): Promise<void> {
  await updateJobStatus(id, "Queued");
  await addSystemLog({
    eventType: "system",
    level: "info",
    message: `Job requeued for retry (id: ${id})`,
    module: "jobs",
    jobId: id,
  });
  revalidatePath("/admin/jobs");
}
