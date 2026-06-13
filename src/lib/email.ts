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

export async function sendOnboardingConfirmationEmail(
  to: string,
  clientName: string,
  data: {
    company_name: string;
    industry: string;
    target_market: string;
    business_goals: string;
    primary_challenges: string;
  }
): Promise<SendResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://arashiops.vercel.app";
  const portalLink = `${appUrl}/client/onboarding`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">

      <!-- Header -->
      <div style="background:#0a0a0a;padding:32px 40px;border-radius:12px 12px 0 0">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td>
              <div style="display:inline-flex;align-items:center;gap:10px">
                <div style="width:32px;height:32px;background:#ffffff;border-radius:8px;display:flex;align-items:center;justify-content:center">
                  <span style="font-size:18px;font-weight:900;color:#0a0a0a;letter-spacing:-1px;font-family:Arial,sans-serif">A</span>
                </div>
                <span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Arashi OPS</span>
              </div>
            </td>
            <td style="text-align:right">
              <span style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em">Revenue Operations</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Hero -->
      <div style="background:#0a0a0a;padding:0 40px 40px">
        <div style="border-top:1px solid #1f1f1f;padding-top:32px">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:600">We're locked in</p>
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2">Your onboarding is confirmed.</h1>
          <p style="margin:0;font-size:15px;color:#9ca3af;line-height:1.6">Hi ${clientName}, we've received everything we need to get started. Here's what we captured — and what happens next.</p>
        </div>
      </div>

      <!-- Body -->
      <div style="background:#ffffff;padding:40px;border:1px solid #e5e7eb;border-top:none">

        <!-- What we heard -->
        <p style="margin:0 0 20px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">What we captured</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:32px">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;width:38%">
              <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">Company</span>
            </td>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
              <span style="font-size:14px;color:#111111;font-weight:500">${data.company_name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
              <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">Industry</span>
            </td>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
              <span style="font-size:14px;color:#111111;font-weight:500">${data.industry}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
              <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">Target Market</span>
            </td>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
              <span style="font-size:14px;color:#111111;font-weight:500">${data.target_market}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
              <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">Goals</span>
            </td>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
              <span style="font-size:14px;color:#111111;font-weight:500">${data.business_goals}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0;vertical-align:top">
              <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">Challenges</span>
            </td>
            <td style="padding:12px 0;vertical-align:top">
              <span style="font-size:14px;color:#111111;font-weight:500">${data.primary_challenges}</span>
            </td>
          </tr>
        </table>

        <!-- Next step -->
        <div style="background:#0a0a0a;border-radius:10px;padding:24px 28px;margin-bottom:32px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">What's next</p>
          <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#ffffff">Discovery call with the Arashi team</p>
          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6">We'll use everything you've shared to come prepared. Expect a focused 30-minute session — no fluff, just strategy. We'll confirm the time shortly.</p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:32px">
          <a href="${portalLink}" style="display:inline-block;background:#0a0a0a;color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:-0.2px">View your portal →</a>
        </div>

        <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6">Questions before the call? Just reply to this email.<br/>We'll get back to you same day.</p>
      </div>

      <!-- Footer -->
      <div style="padding:20px 40px;text-align:center;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;background:#fafafa">
        <p style="margin:0;font-size:11px;color:#9ca3af">Arashi OPS · <a href="https://arashiops.vercel.app" style="color:#9ca3af;text-decoration:none">arashiops.vercel.app</a></p>
      </div>

    </div>
  `;
  return sendEmail({
    to,
    subject: `You're in, ${clientName.split(" ")[0]} — let's get to work`,
    html,
    template: "onboarding_confirmation",
  });
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
