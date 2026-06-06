"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyOwnerSession } from "./dal";
import {
  createProject, updateProjectFields,
  createMilestone, updateMilestoneStatus,
  createNotification,
} from "./queries";
import { sql } from "./db";

// ─── Create project ───────────────────────────────────────────────────────────

const CreateProjectSchema = z.object({
  clientId:     z.string().refine((v) => !isNaN(Number(v))),
  title:        z.string().min(1, "Title is required"),
  status:       z.enum(["Pending", "Planning", "Active", "Review", "Waiting On Client", "Completed", "Paused", "Cancelled"]),
  priority:     z.enum(["Low", "Medium", "High", "Critical"]),
  deadline:     z.string().min(1, "Deadline is required"),
  agent:        z.string().min(1, "Agent is required"),
  description:  z.string().optional(),
});

export type CreateProjectState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
  projectId?: number;
} | null;

export async function createProjectAction(
  _prev: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  try {
    const session = await verifyOwnerSession();

    const parsed = CreateProjectSchema.safeParse({
      clientId:    formData.get("clientId"),
      title:       formData.get("title"),
      status:      formData.get("status"),
      priority:    formData.get("priority"),
      deadline:    formData.get("deadline"),
      agent:       formData.get("agent"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const { clientId, ...rest } = parsed.data;
    const project = await createProject({
      clientId: Number(clientId),
      ...rest,
      assignedOwner: session.name,
    });

    await createNotification({
      type: "project_created",
      title: "New Project Created",
      message: `"${rest.title}" has been created.`,
      clientId: Number(clientId),
    });

    await sql`
      INSERT INTO activity_log (type, description)
      VALUES ('project', ${`Project "${rest.title}" created`})
    `;

    revalidatePath("/admin/projects");
    revalidatePath("/admin");
    return { success: true, projectId: project.id };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// ─── Update project status / progress ────────────────────────────────────────

export async function updateProjectStatusAction(
  projectId: number,
  status: string
): Promise<{ ok: boolean }> {
  try {
    const session = await verifyOwnerSession();
    if (!session) return { ok: false };
    await updateProjectFields(projectId, { status });
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function updateProjectProgressAction(
  projectId: number,
  progress: number
): Promise<{ ok: boolean }> {
  try {
    const session = await verifyOwnerSession();
    if (!session) return { ok: false };
    await updateProjectFields(projectId, { progress: Math.min(100, Math.max(0, progress)) });
    revalidatePath(`/admin/projects/${projectId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ─── Milestones ───────────────────────────────────────────────────────────────

const MilestoneSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate:     z.string().optional(),
});

export type MilestoneState = { error?: string; success?: boolean } | null;

export async function addMilestoneAction(
  projectId: number,
  _prev: MilestoneState,
  formData: FormData
): Promise<MilestoneState> {
  try {
    await verifyOwnerSession();

    const parsed = MilestoneSchema.safeParse({
      title:       formData.get("title"),
      description: formData.get("description"),
      dueDate:     formData.get("dueDate"),
    });

    if (!parsed.success) return { error: "Title is required." };

    await createMilestone(
      projectId,
      parsed.data.title,
      parsed.data.description ?? null,
      parsed.data.dueDate ?? null
    );

    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateMilestoneStatusAction(
  id: number,
  status: string,
  projectId: number
): Promise<{ ok: boolean }> {
  try {
    await verifyOwnerSession();
    await updateMilestoneStatus(id, status);
    revalidatePath(`/admin/projects/${projectId}`);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
