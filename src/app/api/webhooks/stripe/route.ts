import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createBillingEvent, markBillingEventProcessed, createSubscription, updateSubscription, createBillingRenewal, createBillingPayment, getStripeCustomer, upsertStripeCustomer, createNotification } from "@/lib/queries";

export const dynamic = "force-dynamic";

async function getClientIdFromStripeCustomer(stripeCustomerId: string): Promise<number | null> {
  const rows = await sql`SELECT client_id FROM stripe_customers WHERE stripe_customer_id = ${stripeCustomerId} LIMIT 1` as any[];
  return rows[0]?.client_id ?? null;
}

async function getSubByStripeId(stripeSubId: string): Promise<{ id: number } | null> {
  const rows = await sql`SELECT id FROM subscriptions WHERE stripe_subscription_id = ${stripeSubId} LIMIT 1` as any[];
  return rows[0] ?? null;
}

export async function POST(req: NextRequest) {
  const stripeSecretKey  = process.env.STRIPE_SECRET_KEY;
  const webhookSecret    = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const hdrs = await headers();
  const sig  = hdrs.get("stripe-signature");
  const body = await req.text();

  let event: any;
  try {
    const { constructWebhookEvent } = await import("@/lib/stripe");
    event = constructWebhookEvent(body, sig!, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Store event (idempotent)
  const { id: eventRowId } = await createBillingEvent({
    stripeEventId: event.id,
    eventType: event.type,
    payload: JSON.stringify(event.data.object),
  });
  if (!eventRowId) return NextResponse.json({ received: true }); // already processed

  try {
    const obj = event.data.object;

    switch (event.type) {
      case "checkout.session.completed": {
        const clientId = obj.metadata?.arashi_client_id ? Number(obj.metadata.arashi_client_id) : null;
        if (clientId && obj.subscription) {
          const existing = await getSubByStripeId(obj.subscription);
          if (!existing) {
            const periodStart = obj.subscription_data?.trial_end
              ? new Date(obj.subscription_data.trial_end * 1000).toISOString()
              : new Date().toISOString();
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            await createSubscription({
              clientId, stripeSubscriptionId: obj.subscription,
              status: "Active", mrr: (obj.amount_total ?? 0) / 100,
              arr: ((obj.amount_total ?? 0) / 100) * 12,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd.toISOString(),
            });
          }
          // Upsert Stripe customer
          if (obj.customer) {
            await upsertStripeCustomer({ clientId, stripeCustomerId: obj.customer, email: obj.customer_details?.email ?? null, name: obj.customer_details?.name ?? null });
          }
          await createNotification({ type: "invoice_paid" as any, title: "Payment Successful", message: `Checkout completed. Subscription activated.`, clientId });
        }
        break;
      }

      case "invoice.paid": {
        const clientId = obj.metadata?.arashi_client_id
          ? Number(obj.metadata.arashi_client_id)
          : await getClientIdFromStripeCustomer(obj.customer);
        if (clientId) {
          await createBillingPayment({
            clientId, amount: (obj.amount_paid ?? 0) / 100,
            method: "Stripe", paymentDate: new Date(obj.created * 1000).toISOString().slice(0, 10),
            reference: obj.id, stripeChargeId: obj.charge ?? null,
            currency: obj.currency ?? "usd", billingStatus: "Paid",
          });
          if (obj.subscription) {
            const sub = await getSubByStripeId(obj.subscription);
            if (sub) {
              await updateSubscription(sub.id, { status: "Active" });
              await createBillingRenewal({
                clientId, subscriptionId: sub.id,
                renewalDate: new Date(obj.created * 1000).toISOString().slice(0, 10),
                status: "Renewed", amount: (obj.amount_paid ?? 0) / 100,
                stripeInvoiceId: obj.id,
              });
            }
          }
          await createNotification({ type: "invoice_paid" as any, title: "Invoice Paid", message: `$${((obj.amount_paid ?? 0) / 100).toFixed(2)} payment received.`, clientId });
        }
        break;
      }

      case "invoice.payment_failed": {
        const clientId = obj.metadata?.arashi_client_id
          ? Number(obj.metadata.arashi_client_id)
          : await getClientIdFromStripeCustomer(obj.customer);
        if (clientId) {
          await createBillingPayment({
            clientId, amount: (obj.amount_due ?? 0) / 100,
            method: "Stripe", paymentDate: new Date(obj.created * 1000).toISOString().slice(0, 10),
            reference: obj.id, currency: obj.currency ?? "usd", billingStatus: "Failed",
          });
          if (obj.subscription) {
            const sub = await getSubByStripeId(obj.subscription);
            if (sub) await updateSubscription(sub.id, { status: "Past Due" });
          }
          await createNotification({ type: "invoice_overdue" as any, title: "Payment Failed", message: `Payment of $${((obj.amount_due ?? 0) / 100).toFixed(2)} failed.`, clientId });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = await getSubByStripeId(obj.id);
        if (sub) {
          const status = obj.status === "active" ? "Active"
            : obj.status === "past_due"  ? "Past Due"
            : obj.status === "canceled"  ? "Cancelled"
            : obj.status === "trialing"  ? "Trial"
            : obj.status === "paused"    ? "Paused"
            : "Active";
          await updateSubscription(sub.id, {
            status,
            currentPeriodEnd: new Date(obj.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = await getSubByStripeId(obj.id);
        if (sub) await updateSubscription(sub.id, { status: "Cancelled", cancelledAt: new Date().toISOString() });
        break;
      }

      case "charge.refunded": {
        const clientId = await getClientIdFromStripeCustomer(obj.customer ?? "");
        if (clientId) {
          await createNotification({ type: "invoice_paid" as any, title: "Charge Refunded", message: `$${(obj.amount_refunded / 100).toFixed(2)} refunded.`, clientId });
        }
        break;
      }
    }

    await markBillingEventProcessed(eventRowId);
  } catch (err) {
    await markBillingEventProcessed(eventRowId, err instanceof Error ? err.message : "Processing error");
  }

  return NextResponse.json({ received: true });
}
