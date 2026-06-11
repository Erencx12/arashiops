"use server";

import { revalidatePath } from "next/cache";
import {
  getPlans, getPlanBySlug, createPlan, updatePlan,
  getActiveSubscription, createSubscription, updateSubscription,
  createRefund, updateRefundStatus,
  getBillingPayments, createBillingPayment,
  createPlanChange, createBillingRenewal,
  getStripeCustomer, upsertStripeCustomer,
  createNotification, addSystemLog, getClients,
} from "./queries";
import { getActiveProvider } from "./payments";
import { writeAuditLog } from "./audit";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function createCheckoutAction(clientId: number, planSlug: string): Promise<{
  error?: string; checkoutUrl?: string; sessionId?: string; demoMode?: boolean;
}> {
  const clients = await getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) return { error: "Client not found" };

  const plan = await getPlanBySlug(planSlug);
  if (!plan) return { error: "Plan not found" };

  const provider = getActiveProvider();

  if (!provider.isConfigured()) {
    // Demo mode: create subscription manually
    const existing = await getActiveSubscription(clientId);
    if (!existing) {
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await createSubscription({
        clientId, planId: plan.id, planName: plan.name, tier: plan.tier,
        status: "Active", mrr: plan.price_monthly, arr: plan.price_monthly * 12,
        currentPeriodStart: periodStart.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
      });
    }
    revalidatePath("/admin/billing");
    revalidatePath("/client/billing");
    return { demoMode: true };
  }

  try {
    // Resolve the provider-specific plan/price ID
    let priceId: string | null = null;
    if (provider.providerName === "paypal") {
      priceId = (plan as any).paypal_plan_id ?? null;
      if (!priceId) return { error: "This plan has no PayPal Plan ID configured. Contact your account manager." };
    } else {
      priceId = plan.stripe_price_id ?? null;
      if (!priceId) return { error: "This plan has no Stripe Price ID configured." };
    }

    // Create / retrieve provider customer reference
    const providerCustomerId = await provider.createCustomer({
      clientId, email: client.email, name: client.company_name,
    });

    // Persist Stripe customer mapping when Stripe is active
    if (provider.providerName === "stripe") {
      const existing = await getStripeCustomer(clientId);
      if (!existing) {
        await upsertStripeCustomer({ clientId, stripeCustomerId: providerCustomerId, email: client.email, name: client.company_name });
      }
    }

    const { sessionId, url } = await provider.createCheckout({
      providerCustomerId,
      priceId,
      successUrl: `${APP_URL}/admin/billing?success=1`,
      cancelUrl:  `${APP_URL}/admin/billing?cancelled=1`,
      metadata: { arashi_client_id: String(clientId), plan_slug: planSlug },
    });
    return { sessionId, checkoutUrl: url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Payment provider error" };
  }
}

// ─── Manual Subscription ──────────────────────────────────────────────────────

export async function createSubscriptionAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const clientId  = Number(formData.get("clientId"));
  const planSlug  = formData.get("planSlug") as string;
  const status    = (formData.get("status") as string) || "Active";
  const notes     = (formData.get("notes")  as string) || null;
  const startDate = (formData.get("startDate") as string) || new Date().toISOString().slice(0, 10);

  if (!clientId || !planSlug) return { error: "Client and plan are required" };

  const plan = await getPlanBySlug(planSlug);
  if (!plan) return { error: "Plan not found" };

  const periodStart = new Date(startDate);
  const periodEnd = new Date(startDate);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  try {
    await createSubscription({
      clientId, planId: plan.id, planName: plan.name, tier: plan.tier,
      status, mrr: plan.price_monthly, arr: plan.price_monthly * 12,
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(), notes,
    });
    await createNotification({
      type: "client_created" as any,
      title: "Subscription Created",
      message: `${plan.name} subscription created.`,
      clientId,
    });
    void writeAuditLog({ action: "billing.subscription_created", targetType: "client", targetId: clientId, details: { plan: plan.name, status } });
    await addSystemLog({ eventType: "integration", level: "info", message: `Subscription created: ${plan.name} for client ${clientId}`, module: "billing", clientId });
    revalidatePath("/admin/billing");
    revalidatePath("/client/billing");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create subscription" };
  }
}

export async function updateSubscriptionStatusAction(subId: number, status: string): Promise<void> {
  const cancelledAt = status === "Cancelled" ? new Date().toISOString() : null;
  await updateSubscription(subId, { status, cancelledAt });
  await addSystemLog({ eventType: "integration", level: "info", message: `Subscription ${subId} status → ${status}`, module: "billing" });
  revalidatePath("/admin/billing");
  revalidatePath("/client/billing");
}

export async function cancelSubscriptionAction(subId: number, stripeSubscriptionId?: string | null): Promise<{ error?: string }> {
  try {
    if (stripeSubscriptionId) {
      const provider = getActiveProvider();
      if (provider.isConfigured()) await provider.cancelSubscription(stripeSubscriptionId);
    }
    await updateSubscription(subId, { status: "Cancelled", cancelledAt: new Date().toISOString() });
    await addSystemLog({ eventType: "integration", level: "warn", message: `Subscription ${subId} cancelled`, module: "billing" });
    void writeAuditLog({ action: "billing.subscription_cancelled", targetType: "subscription", targetId: subId });
    revalidatePath("/admin/billing");
    revalidatePath("/client/billing");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Cancellation failed" };
  }
}

// ─── Plan Changes ─────────────────────────────────────────────────────────────

export async function changePlanAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const clientId      = Number(formData.get("clientId"));
  const newPlanSlug   = formData.get("newPlanSlug") as string;
  const reason        = formData.get("reason") as string | null;
  const changeType    = (formData.get("changeType") as string) || "upgrade";

  if (!clientId || !newPlanSlug) return { error: "Client and plan are required" };

  const newPlan = await getPlanBySlug(newPlanSlug);
  if (!newPlan) return { error: "Target plan not found" };

  const current = await getActiveSubscription(clientId);

  try {
    const revenueImpact = current?.mrr != null ? newPlan.price_monthly - current.mrr : null;

    if (current) {
      await createPlanChange({
        clientId, subscriptionId: current.id,
        fromPlanId: current.plan_id, toPlanId: newPlan.id,
        fromTier: current.tier, toTier: newPlan.tier,
        changeType, effectiveDate: new Date().toISOString().slice(0, 10),
        reason, revenueImpact, createdBy: "Soham Das",
      });
      await updateSubscription(current.id, {
        planId: newPlan.id, planName: newPlan.name,
        tier: newPlan.tier, mrr: newPlan.price_monthly,
        arr: newPlan.price_monthly * 12,
      });
    } else {
      // Create new subscription with new plan
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await createSubscription({
        clientId, planId: newPlan.id, planName: newPlan.name, tier: newPlan.tier,
        status: "Active", mrr: newPlan.price_monthly, arr: newPlan.price_monthly * 12,
        currentPeriodStart: periodStart.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
      });
    }

    const label = changeType === "upgrade" ? "Upgrade Completed" : "Downgrade Completed";
    await createNotification({ type: "tier_upgraded" as any, title: label, message: `Plan changed to ${newPlan.name}.`, clientId });
    await addSystemLog({ eventType: "integration", level: "info", message: `Plan ${changeType}: client ${clientId} → ${newPlan.name}`, module: "billing", clientId });
    void writeAuditLog({ action: "billing.plan_changed", targetType: "client", targetId: clientId, details: { newPlan: newPlan.name, changeType } });

    revalidatePath("/admin/billing");
    revalidatePath("/client/billing");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Plan change failed" };
  }
}

// ─── Refunds ──────────────────────────────────────────────────────────────────

export async function issueRefundAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const clientId  = Number(formData.get("clientId")) || null;
  const paymentId = Number(formData.get("paymentId")) || null;
  const amount    = Number(formData.get("amount"));
  const reason    = formData.get("reason") as string | null;
  const notes     = formData.get("notes")  as string | null;

  if (!amount || amount <= 0) return { error: "Valid refund amount is required" };

  try {
    const refundRow = await createRefund({ paymentId, clientId, amount, reason, notes, processedBy: "Soham Das" });

    // Attempt provider refund if a charge reference is available
    if (paymentId) {
      try {
        const payments = await getBillingPayments(clientId ?? undefined, 200);
        const payment = payments.find(p => p.id === paymentId);
        const chargeRef = payment?.stripe_charge_id;
        if (chargeRef) {
          const provider = getActiveProvider();
          if (provider.isConfigured()) {
            const refundId = await provider.createRefund(chargeRef, amount, reason ?? undefined);
            await updateRefundStatus(refundRow.id, "Processed", refundId);
          } else {
            await updateRefundStatus(refundRow.id, "Processed");
          }
        } else {
          await updateRefundStatus(refundRow.id, "Processed");
        }
      } catch {
        // Leave as Pending if provider refund fails
      }
    }

    await createNotification({ type: "invoice_paid" as any, title: "Refund Issued", message: `$${amount.toFixed(2)} refund issued.`, clientId });
    void writeAuditLog({ action: "billing.refund_issued", targetType: "client", targetId: clientId ?? undefined, details: { amount, reason } });
    await addSystemLog({ eventType: "integration", level: "warn", message: `Refund issued: $${amount} for client ${clientId}`, module: "billing", clientId: clientId ?? null });

    revalidatePath("/admin/billing");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Refund failed" };
  }
}

// ─── Plans CRUD ───────────────────────────────────────────────────────────────

export async function createPlanAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const name         = (formData.get("name")         as string)?.trim();
  const description  = (formData.get("description")  as string)?.trim();
  const priceMonthly = Number(formData.get("priceMonthly"));
  const priceAnnual  = Number(formData.get("priceAnnual"))  || null;
  const tier         = (formData.get("tier")         as string) || null;

  if (!name) return { error: "Plan name is required" };

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  try {
    await createPlan({ name, slug, tier, description: description || null, priceMonthly, priceAnnual });
    revalidatePath("/admin/billing");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create plan" };
  }
}

export async function updatePlanAction(id: number, data: {
  status?: string; priceMonthly?: number; description?: string | null;
  stripePriceId?: string | null; stripeProductId?: string | null;
  paypalPlanId?: string | null; paypalProductId?: string | null;
}): Promise<void> {
  await updatePlan(id, data);
  revalidatePath("/admin/billing");
}

// ─── Manual Payment ───────────────────────────────────────────────────────────

export async function recordManualPaymentAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const clientId  = Number(formData.get("clientId")) || null;
  const amount    = Number(formData.get("amount"));
  const method    = (formData.get("method")  as string) || "Bank Transfer";
  const reference = (formData.get("reference") as string) || null;
  const notes     = (formData.get("notes")   as string) || null;

  if (!amount || amount <= 0) return { error: "Valid payment amount is required" };

  try {
    await createBillingPayment({
      clientId, amount, method,
      paymentDate: new Date().toISOString().slice(0, 10),
      reference, notes, billingStatus: "Paid",
    });
    await addSystemLog({ eventType: "integration", level: "info", message: `Manual payment recorded: $${amount}`, module: "billing", clientId: clientId ?? null });
    void writeAuditLog({ action: "billing.payment_recorded", targetType: "client", targetId: clientId ?? undefined, details: { amount, method, reference } });
    revalidatePath("/admin/billing");
    revalidatePath("/client/billing");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to record payment" };
  }
}
