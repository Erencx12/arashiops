import nodemailer from "nodemailer";
import { getEmailConfig, createEmailLog, updateEmailConfigTest } from "./queries";
import { getCredentialValueByService } from "./queries";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  template?: string;
  metadata?: Record<string, unknown>;
};

type SendResult = { success: boolean; error?: string; provider?: string };

async function buildTransporter() {
  const config = await getEmailConfig();

  if (config) {
    const smtpPass = await getCredentialValueByService(config.provider === "gmail" ? "gmail" : config.provider === "outlook" ? "outlook" : "smtp");
    return {
      transporter: nodemailer.createTransport({
        host:   config.smtp_host ?? undefined,
        port:   config.smtp_port,
        secure: config.smtp_secure,
        auth:   config.smtp_user && smtpPass
          ? { user: config.smtp_user, pass: smtpPass }
          : undefined,
      }),
      from:     `"${config.from_name}" <${config.from_email}>`,
      provider: config.provider,
      configId: config.id,
    };
  }

  // Fallback to env vars
  if (process.env.SMTP_HOST) {
    return {
      transporter: nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth:   process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      }),
      from:     `"${process.env.EMAIL_FROM_NAME ?? "Arashi OPS"}" <${process.env.EMAIL_FROM ?? "noreply@arashi.io"}>`,
      provider: "smtp",
      configId: null as number | null,
    };
  }

  return null;
}

export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const setup = await buildTransporter();

  if (!setup) {
    await createEmailLog({
      recipient: payload.to,
      subject:   payload.subject,
      template:  payload.template ?? null,
      status:    "Failed",
      provider:  null,
      errorMessage: "No email provider configured",
      metadata:  payload.metadata ? JSON.stringify(payload.metadata) : null,
    });
    return { success: false, error: "No email provider configured" };
  }

  try {
    await setup.transporter.sendMail({
      from:    setup.from,
      to:      payload.to,
      subject: payload.subject,
      html:    payload.html,
      text:    payload.text ?? payload.html.replace(/<[^>]+>/g, ""),
    });

    await createEmailLog({
      recipient: payload.to,
      subject:   payload.subject,
      template:  payload.template ?? null,
      status:    "Sent",
      provider:  setup.provider,
      metadata:  payload.metadata ? JSON.stringify(payload.metadata) : null,
    });
    return { success: true, provider: setup.provider };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await createEmailLog({
      recipient: payload.to,
      subject:   payload.subject,
      template:  payload.template ?? null,
      status:    "Failed",
      provider:  setup.provider,
      errorMessage: msg,
      metadata:  payload.metadata ? JSON.stringify(payload.metadata) : null,
    });
    return { success: false, error: msg, provider: setup.provider };
  }
}

export async function testEmailConnection(configId: number, testRecipient: string): Promise<SendResult> {
  const result = await sendEmail({
    to:       testRecipient,
    subject:  "Arashi OPS — Email Test",
    html:     `<p>Your email integration is working correctly.</p><p>Sent from <strong>Arashi OPS</strong>.</p>`,
    template: "test",
  });
  await updateEmailConfigTest(configId, result.success);
  return result;
}

// ── Email templates ────────────────────────────────────────────────────────────

export async function sendInviteEmail(to: string, name: string, inviteToken: string, tempPassword: string): Promise<SendResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111111">
      <h2 style="margin:0 0 16px">You're invited to Arashi OPS</h2>
      <p>Hi ${name},</p>
      <p>Your client account has been created. Use the credentials below to log in.</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:24px 0">
        <p style="margin:0;font-size:13px;color:#6b7280">Login URL</p>
        <p style="margin:4px 0 12px;font-weight:600">${baseUrl}/login</p>
        <p style="margin:0;font-size:13px;color:#6b7280">Email</p>
        <p style="margin:4px 0 12px;font-weight:600">${to}</p>
        <p style="margin:0;font-size:13px;color:#6b7280">Temporary Password</p>
        <p style="margin:4px 0;font-weight:600;font-family:monospace">${tempPassword}</p>
      </div>
      <p style="color:#6b7280;font-size:13px">This invite expires in 7 days. Change your password after first login.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Your Arashi OPS Access", html, template: "invite", metadata: { inviteToken } });
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<SendResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111111">
      <h2 style="margin:0 0 16px">Reset your password</h2>
      <p>A password reset was requested for your Arashi OPS account.</p>
      <div style="margin:24px 0">
        <a href="${resetUrl}" style="background:#111111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Reset Password
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Reset your Arashi OPS password", html, template: "reset" });
}

export async function sendInvoiceEmail(to: string, clientName: string, invoiceNumber: string, amount: number, dueDate: string): Promise<SendResult> {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111111">
      <h2 style="margin:0 0 16px">Invoice ${invoiceNumber}</h2>
      <p>Hi ${clientName},</p>
      <p>Please find your invoice details below.</p>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:24px 0">
        <p style="margin:0;font-size:13px;color:#6b7280">Invoice Number</p>
        <p style="margin:4px 0 12px;font-weight:600">${invoiceNumber}</p>
        <p style="margin:0;font-size:13px;color:#6b7280">Amount Due</p>
        <p style="margin:4px 0 12px;font-weight:600;font-size:18px">$${amount.toLocaleString()}</p>
        <p style="margin:0;font-size:13px;color:#6b7280">Due Date</p>
        <p style="margin:4px 0;font-weight:600">${dueDate}</p>
      </div>
      <p style="color:#6b7280;font-size:13px">Contact your Arashi OPS account manager with any questions.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Invoice ${invoiceNumber} — $${amount.toLocaleString()} due ${dueDate}`, html, template: "invoice" });
}

export async function sendProposalEmail(to: string, clientName: string, proposalTitle: string, expiresAt: string): Promise<SendResult> {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111111">
      <h2 style="margin:0 0 16px">Proposal: ${proposalTitle}</h2>
      <p>Hi ${clientName},</p>
      <p>We've prepared a proposal for your review. Please log in to your Arashi OPS portal to view and accept it.</p>
      <p style="color:#6b7280;font-size:13px">This proposal expires on ${expiresAt}.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Proposal: ${proposalTitle}`, html, template: "proposal" });
}

export async function sendContractEmail(to: string, clientName: string, contractNumber: string): Promise<SendResult> {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111111">
      <h2 style="margin:0 0 16px">Contract ${contractNumber} ready for signature</h2>
      <p>Hi ${clientName},</p>
      <p>Your contract is ready. Log in to your Arashi OPS portal to review and sign.</p>
    </div>
  `;
  return sendEmail({ to, subject: `Contract ${contractNumber} — Action Required`, html, template: "contract" });
}

export async function sendNotificationEmail(to: string, title: string, message: string): Promise<SendResult> {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#111111">
      <h2 style="margin:0 0 16px">${title}</h2>
      <p>${message}</p>
      <p style="color:#6b7280;font-size:13px">Arashi OPS · Notification</p>
    </div>
  `;
  return sendEmail({ to, subject: title, html, template: "notification" });
}
