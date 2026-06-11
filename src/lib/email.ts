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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://arashiops.vercel.app";
  const portalLink = `${appUrl}/client/billing`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <!-- Header -->
      <div style="background:#111111;padding:28px 32px">
        <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Arashi OPS</p>
        <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Revenue Operations Agency</p>
      </div>
      <!-- Body -->
      <div style="padding:32px">
        <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111111">Invoice ${invoiceNumber}</p>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280">Hi ${clientName}, a new invoice has been issued for your account.</p>
        <!-- Invoice details box -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin-bottom:28px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:0 0 14px;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Invoice Number</td>
              <td style="padding:0 0 14px;font-size:13px;color:#111111;font-weight:600;text-align:right">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding:0 0 14px;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Amount Due</td>
              <td style="padding:0 0 14px;font-size:22px;color:#111111;font-weight:700;text-align:right">$${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:0;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Due Date</td>
              <td style="padding:0;font-size:13px;color:#111111;font-weight:600;text-align:right">${dueDate}</td>
            </tr>
          </table>
        </div>
        <!-- CTA -->
        <div style="text-align:center;margin-bottom:16px">
          <a href="https://paypal.me/Arashiops/${amount}" style="display:inline-block;background:#0070ba;color:#ffffff;font-size:14px;font-weight:600;padding:13px 32px;border-radius:8px;text-decoration:none;letter-spacing:-0.1px">Pay $${amount.toLocaleString()} via PayPal →</a>
        </div>
        <div style="text-align:center;margin-bottom:28px">
          <a href="${portalLink}" style="font-size:12px;color:#6b7280;text-decoration:underline">View invoice in portal</a>
        </div>
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Questions? Reply to this email or contact your Arashi OPS account manager.</p>
      </div>
      <!-- Footer -->
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
        <p style="margin:0;font-size:11px;color:#9ca3af">Arashi OPS · arashiops.vercel.app</p>
      </div>
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
