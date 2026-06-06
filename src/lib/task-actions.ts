"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import { createTask, updateTaskStatus } from "./queries";

const TaskSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority:    z.enum(["Low", "Medium", "High", "Critical"]),
  assignee:    z.string().optional(),
  clientId:    z.string().optional(),
  projectId:   z.string().optional(),
  dueDate:     z.string().optional(),
});

export type TaskState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function createTaskAction(
  _prev: TaskState,
  formData: FormData
): Promise<TaskState> {
  try {
    await verifyOwnerSession();

    const parsed = TaskSchema.safeParse({
      title:       formData.get("title"),
      description: formData.get("description"),
      priority:    formData.get("priority"),
      assignee:    formData.get("assignee"),
      clientId:    formData.get("clientId"),
      projectId:   formData.get("projectId"),
      dueDate:     formData.get("dueDate"),
    });

    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    await createTask({
      title:       parsed.data.title,
      description: parsed.data.description ?? null,
      priority:    parsed.data.priority,
      assignee:    parsed.data.assignee || null,
      clientId:    parsed.data.clientId ? Number(parsed.data.clientId) : null,
      projectId:   parsed.data.projectId ? Number(parsed.data.projectId) : null,
      dueDate:     parsed.data.dueDate || null,
    });

    revalidatePath("/admin/tasks");
    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateTaskStatusAction(
  id: number,
  status: string
): Promise<{ ok: boolean }> {
  try {
    await verifyOwnerSession();
    await updateTaskStatus(id, status);
    revalidatePath("/admin/tasks");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
