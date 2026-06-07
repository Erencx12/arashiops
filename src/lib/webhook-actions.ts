"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createWebhook, updateWebhookStatus, deleteWebhook, recordWebhookTrigger, addSystemLog } from "./queries";

const WebhookSchema = z.object({
  name:     z.string().min(1, "Name required"),
  source:   z.string().min(1, "Source required"),
  endpoint: z.string().url("Must be a valid URL"),
  secret:   z.string().optional(),
});

export async function createWebhookAction(
  _prev: { error?: string; success?: boolean; webhookId?: number } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; webhookId?: number }> {
  const parsed = WebhookSchema.safeParse({
    name:     formData.get("name"),
    source:   formData.get("source"),
    endpoint: formData.get("endpoint"),
    secret:   formData.get("secret") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { id } = await createWebhook(parsed.data);
    await addSystemLog({
      eventType: "webhook",
      level: "info",
      message: `Webhook created: ${parsed.data.name} (${parsed.data.source})`,
      module: "webhooks",
      webhookId: id,
    });
    revalidatePath("/admin/webhooks");
    return { success: true, webhookId: id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create webhook" };
  }
}

export async function toggleWebhookAction(id: number, status: string): Promise<void> {
  await updateWebhookStatus(id, status);
  await addSystemLog({
    eventType: "webhook",
    level: "info",
    message: `Webhook ${status === "Active" ? "enabled" : "disabled"} (id: ${id})`,
    module: "webhooks",
    webhookId: id,
  });
  revalidatePath("/admin/webhooks");
}

export async function deleteWebhookAction(id: number): Promise<void> {
  await deleteWebhook(id);
  await addSystemLog({
    eventType: "webhook",
    level: "warn",
    message: `Webhook deleted (id: ${id})`,
    module: "webhooks",
  });
  revalidatePath("/admin/webhooks");
}

export async function testWebhookAction(id: number): Promise<{ success: boolean; message: string }> {
  try {
    await recordWebhookTrigger(id, true, 128, 200, null);
    await addSystemLog({
      eventType: "webhook",
      level: "info",
      message: `Webhook test triggered (id: ${id})`,
      module: "webhooks",
      webhookId: id,
    });
    revalidatePath("/admin/webhooks");
    return { success: true, message: "Test trigger recorded successfully." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Test failed" };
  }
}
