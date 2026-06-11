import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPayPalWebhook } from "@/lib/paypal";
import {
  createSubscription, updateSubscription,
  createBillingPayment, createBillingRenewal,
  createNotification,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

async function getSubByPayPalId(paypalSubId: string): Promise<{ id: number; client_id: number } | null> {
  const rows = await sql`
    SELECT id, client_id FROM subscriptions
    WHERE stripe_subscription_id = ${paypalSubId} LIMIT 1
  ` as any[];
  return rows[0] ?? null;
}

export async function POST(req: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!process.env.PAYPAL_CLIENT_ID || !webhookId) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 400 });
  }

  const hdrs = await headers();
  const body = await req.text();

  const verified = await verifyPayPalWebhook({
    webhookId,
    headers: {
      "paypal-transmission-id":   hdrs.get("paypal-transmission-id")   ?? "",
      "paypal-transmission-time": hdrs.get("paypal-transmission-time") ?? "",
      "paypal-cert-url":          hdrs.get("paypal-cert-url")          ?? "",
      "paypal-auth-algo":         hdrs.get("paypal-auth-algo")         ?? "",
      "paypal-transmission-sig":  hdrs.get("paypal-transmission-sig")  ?? "",
    },
    body,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try { event = JSON.parse(body); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const resource = event.resource ?? {};

  try {
    switch (event.event_type) {

      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        let clientId: number | null = null;
        try {
          const meta = JSON.parse(resource.custom_id ?? "{}");
          clientId = meta.arashi_client_id ? Number(meta.arashi_client_id) : null;
        } catch {}

        if (clientId) {
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          await createSubscription({
            clientId,
            stripeSubscriptionId: resource.id, // reused field for PayPal sub ID
            status: "Active",
            mrr: 0,
            arr: 0,
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd:   periodEnd.toISOString(),
          });
          await createNotification({
            type: "invoice_paid" as any,
            title: "Subscription Activated",
            message: "Your PayPal subscription is now active.",
            clientId,
          });
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const paypalSubId = resource.billing_agreement_id;
        if (!paypalSubId) break;

        const sub    = await getSubByPayPalId(paypalSubId);
        const amount = parseFloat(resource.amount?.total ?? "0");

        if (sub) {
          await createBillingPayment({
            clientId:      sub.client_id,
            amount,
            method:        "PayPal",
            paymentDate:   new Date().toISOString().slice(0, 10),
            reference:     resource.id,
            currency:      resource.amount?.currency ?? "USD",
            billingStatus: "Paid",
          });
          await updateSubscription(sub.id, { status: "Active" });
          await createBillingRenewal({
            clientId:       sub.client_id,
            subscriptionId: sub.id,
            renewalDate:    new Date().toISOString().slice(0, 10),
            status:         "Renewed",
            amount,
          });
          await createNotification({
            type:     "invoice_paid" as any,
            title:    "Payment Received",
            message:  `$${amount.toFixed(2)} received via PayPal.`,
            clientId: sub.client_id,
          });
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        const sub = await getSubByPayPalId(resource.id);
        if (sub) {
          await updateSubscription(sub.id, { status: "Past Due" });
          await createNotification({
            type:     "invoice_overdue" as any,
            title:    "PayPal Payment Failed",
            message:  "Subscription payment failed — your subscription is past due.",
            clientId: sub.client_id,
          });
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const sub = await getSubByPayPalId(resource.id);
        if (sub) {
          await updateSubscription(sub.id, {
            status:      "Cancelled",
            cancelledAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const sub = await getSubByPayPalId(resource.id);
        if (sub) await updateSubscription(sub.id, { status: "Past Due" });
        break;
      }
    }
  } catch (err) {
    console.error("PayPal webhook error:", err);
  }

  return NextResponse.json({ received: true });
}
