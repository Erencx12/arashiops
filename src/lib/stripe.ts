import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
}

export function getStripePublishableKey(): string | null {
  return process.env.STRIPE_PUBLISHABLE_KEY ?? null;
}

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil" as any,
    });
  }
  return _stripe;
}

export async function getOrCreateStripeCustomer(clientId: number, email: string, name: string): Promise<string> {
  const stripe = getStripe();
  const customer = await stripe.customers.create({ email, name, metadata: { arashi_client_id: String(clientId) } });
  return customer.id;
}

export async function createCheckoutSession(opts: {
  stripeCustomerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    customer: opts.stripeCustomerId,
    payment_method_types: ["card"],
    line_items: [{ price: opts.priceId, quantity: 1 }],
    mode: "subscription",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: opts.metadata,
  });
  return { sessionId: session.id, url: session.url! };
}

export async function cancelStripeSubscription(stripeSubscriptionId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.cancel(stripeSubscriptionId);
}

export async function createStripeRefund(chargeId: string, amount: number, reason?: string): Promise<string> {
  const stripe = getStripe();
  const refund = await stripe.refunds.create({
    charge: chargeId,
    amount: Math.round(amount * 100),
    reason: (reason as any) ?? "requested_by_customer",
  });
  return refund.id;
}

export function constructWebhookEvent(payload: string, sig: string, secret: string): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, sig, secret);
}

export type { Stripe };
