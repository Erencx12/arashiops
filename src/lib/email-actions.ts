"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import {
  upsertEmailConfig, getAllEmailConfigs, updateEmailConfigTest,
  addSystemLog, createNotification, getIntegrationBySlug, updateIntegrationHealth,
} from "./queries";
import { testEmailConnection } from "./email";

const EmailConfigSchema = z.object({
  provider:    z.string().min(1, "Provider required"),
  smtpHost:    z.string().optional(),
  smtpPort:    z.string().optional(),
  smtpSecure:  z.string().optional(),
  smtpUser:    z.string().optional(),
  fromName:    z.string().min(1, "From name required"),
  fromEmail:   z.string().email("Invalid from email"),
});

export async function saveEmailConfigAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const parsed = EmailConfigSchema.safeParse({
    provider:   formData.get("provider"),
    smtpHost:   formData.get("smtpHost") || undefined,
    smtpPort:   formData.get("smtpPort") || undefined,
    smtpSecure: formData.get("smtpSecure") || undefined,
    smtpUser:   formData.get("smtpUser") || undefined,
    fromName:   formData.get("fromName"),
    fromEmail:  formData.get("fromEmail"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { provider, smtpHost, smtpPort, smtpSecure, smtpUser, fromName, fromEmail } = parsed.data;

  try {
    const integ = await getIntegrationBySlug(provider);
    await upsertEmailConfig({
      provider,
      integrationId: integ?.id ?? null,
      smtpHost:      smtpHost || null,
      smtpPort:      smtpPort ? Number(smtpPort) : 587,
      smtpSecure:    smtpSecure === "true",
      smtpUser:      smtpUser || null,
      fromName,
      fromEmail,
    });
    await addSystemLog({
      eventType: "integration",
      level:     "info",
      message:   `Email config saved: provider=${provider}, from=${fromEmail}`,
      module:    "email",
    });
    revalidatePath("/admin/integrations");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save config" };
  }
}

export async function sendTestEmailAction(
  _prev: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const configId = Number(formData.get("configId"));
  const recipient = String(formData.get("recipient") ?? "");
  if (!recipient || !recipient.includes("@")) return { error: "Valid recipient email required" };
  if (!configId) return { error: "No email config ID" };

  try {
    const result = await testEmailConnection(configId, recipient);
    if (result.success) {
      await addSystemLog({
        eventType: "integration",
        level:     "info",
        message:   `Test email sent successfully to ${recipient} via ${result.provider}`,
        module:    "email",
      });
      const integ = await getIntegrationBySlug(result.provider ?? "smtp");
      if (integ) {
        await updateIntegrationHealth(integ.id, { status: "Connected", lastSync: new Date().toISOString(), healthScore: 100 });
      }
      revalidatePath("/admin/integrations");
      return { success: true, message: `Test email delivered to ${recipient}` };
    } else {
      await addSystemLog({
        eventType: "integration",
        level:     "error",
        message:   `Test email failed: ${result.error}`,
        module:    "email",
      });
      return { error: result.error ?? "Send failed" };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Test failed" };
  }
}

export async function sendEmailFromAdmin(
  recipient: string, subject: string, html: string, template: string
): Promise<{ success: boolean; error?: string }> {
  const { sendEmail } = await import("./email");
  const result = await sendEmail({ to: recipient, subject, html, template });
  if (!result.success) {
    await addSystemLog({ eventType: "integration", level: "error", message: `Email failed to ${recipient}: ${result.error}`, module: "email" });
  }
  return result;
}
