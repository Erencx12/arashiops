"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { sql } from "./db";
import {
  toggleIntegration, addCredential, deleteCredential,
  updateCredentialStatus, addSystemLog, updateIntegrationHealth,
  createNotification,
} from "./queries";
import { verifyOwnerSession } from "./dal";
import { writeAuditLog } from "./audit";

export async function toggleIntegrationAction(id: number, enabled: boolean): Promise<void> {
  await verifyOwnerSession();
  await toggleIntegration(id, enabled);
  await addSystemLog({
    eventType: "integration",
    level: "info",
    message: `Integration ${enabled ? "enabled" : "disabled"} (id: ${id})`,
    module: "integrations",
  });
  revalidatePath("/admin/integrations");
}

const CredentialSchema = z.object({
  integrationId: z.string().optional(),
  service:       z.string().min(1, "Service required"),
  keyLabel:      z.string().min(1, "Label required"),
  keyValue:      z.string().min(4, "Key too short"),
});

export async function addCredentialAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await verifyOwnerSession();
  const parsed = CredentialSchema.safeParse({
    integrationId: formData.get("integrationId"),
    service:       formData.get("service"),
    keyLabel:      formData.get("keyLabel"),
    keyValue:      formData.get("keyValue"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { integrationId, service, keyLabel, keyValue } = parsed.data;
  const masked = "••••••••" + keyValue.slice(-4);

  try {
    // Store both masked display and actual key_value
    const integId = integrationId ? Number(integrationId) : null;
    await sql`
      INSERT INTO integration_credentials (integration_id, service, key_label, key_masked, key_value)
      VALUES (${integId}, ${service}, ${keyLabel}, ${masked}, ${keyValue})
    `;
    await addSystemLog({
      eventType: "security",
      level: "info",
      message: `API key added for ${service} (${keyLabel})`,
      module: "integrations",
    });
    void writeAuditLog({ action: "api_key.added", details: { service, keyLabel } });
    revalidatePath("/admin/integrations");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to add credential" };
  }
}

export async function deleteCredentialAction(id: number): Promise<void> {
  await verifyOwnerSession();
  await deleteCredential(id);
  await addSystemLog({
    eventType: "security",
    level: "warn",
    message: `API key deleted (credential id: ${id})`,
    module: "integrations",
  });
  void writeAuditLog({ action: "api_key.removed", details: { credentialId: id } });
  revalidatePath("/admin/integrations");
}

export async function updateCredentialStatusAction(id: number, status: string): Promise<void> {
  await verifyOwnerSession();
  await updateCredentialStatus(id, status);
  revalidatePath("/admin/integrations");
}

export async function connectIntegrationAction(
  integrationId: number,
  slug: string
): Promise<{ success: boolean; error?: string }> {
  await verifyOwnerSession();
  try {
    await updateIntegrationHealth(integrationId, {
      status:      "Connected",
      lastSync:    new Date().toISOString(),
      healthScore: 100,
    });
    await toggleIntegration(integrationId, true);
    await addSystemLog({
      eventType: "integration",
      level:     "info",
      message:   `Integration connected: ${slug}`,
      module:    "integrations",
    });
    await createNotification({
      type:    "client_created",
      title:   "Integration Connected",
      message: `${slug.charAt(0).toUpperCase() + slug.slice(1)} integration connected successfully.`,
    });
    revalidatePath("/admin/integrations");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Connection failed" };
  }
}

export async function disconnectIntegrationAction(integrationId: number, slug: string): Promise<void> {
  await verifyOwnerSession();
  await toggleIntegration(integrationId, false);
  await updateIntegrationHealth(integrationId, {
    status:      "Disconnected",
    healthScore: 0,
  });
  await addSystemLog({
    eventType: "integration",
    level:     "warn",
    message:   `Integration disconnected: ${slug}`,
    module:    "integrations",
  });
  revalidatePath("/admin/integrations");
}

export async function markIntegrationErrorAction(
  integrationId: number,
  error: string
): Promise<void> {
  await verifyOwnerSession();
  await updateIntegrationHealth(integrationId, {
    status:      "Error",
    lastError:   error,
    healthScore: 0,
  });
  await addSystemLog({
    eventType: "integration",
    level:     "error",
    message:   `Integration error: ${error}`,
    module:    "integrations",
  });
  revalidatePath("/admin/integrations");
}
