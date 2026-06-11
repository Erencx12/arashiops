const BASE = () =>
  process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  const id     = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const creds  = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch(`${BASE()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization:  `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:  "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

async function paypalFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${BASE()}${path}`, {
    ...init,
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function createPayPalSubscription(opts: {
  paypalPlanId: string;
  customId:     string;
  subscriberEmail?: string;
  returnUrl:    string;
  cancelUrl:    string;
}): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const body: Record<string, unknown> = {
    plan_id:   opts.paypalPlanId,
    custom_id: opts.customId,
    application_context: {
      brand_name:          "Arashi OPS",
      locale:              "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action:         "SUBSCRIBE_NOW",
      payment_method: {
        payer_selected:   "PAYPAL",
        payee_preferred:  "IMMEDIATE_PAYMENT_REQUIRED",
      },
      return_url: opts.returnUrl,
      cancel_url: opts.cancelUrl,
    },
  };

  if (opts.subscriberEmail) {
    body.subscriber = { email_address: opts.subscriberEmail };
  }

  const res = await paypalFetch("/v1/billing/subscriptions", {
    method: "POST",
    body:   JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`PayPal subscription failed: ${JSON.stringify(err)}`);
  }

  const data       = await res.json();
  const approvalUrl = (data.links as Array<{ rel: string; href: string }>)
    ?.find(l => l.rel === "approve")?.href;

  if (!approvalUrl) throw new Error("PayPal returned no approval URL");
  return { subscriptionId: data.id as string, approvalUrl };
}

export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason = "Cancelled by merchant",
): Promise<void> {
  const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body:   JSON.stringify({ reason }),
  });
  // 422 = already cancelled / not active — treat as success
  if (!res.ok && res.status !== 422) {
    throw new Error(`PayPal cancel failed: ${res.status}`);
  }
}

// ─── Refunds ──────────────────────────────────────────────────────────────────

export async function refundPayPalCapture(
  captureId: string,
  amount:    number,
  currency = "USD",
): Promise<string> {
  const res = await paypalFetch(`/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    body:   JSON.stringify({
      amount: { value: amount.toFixed(2), currency_code: currency },
    }),
  });

  if (!res.ok) throw new Error(`PayPal refund failed: ${res.status}`);
  const data = await res.json();
  return data.id as string;
}

// ─── Webhook Verification ─────────────────────────────────────────────────────

export async function verifyPayPalWebhook(opts: {
  webhookId: string;
  headers:   Record<string, string>;
  body:      string;
}): Promise<boolean> {
  try {
    const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        transmission_id:   opts.headers["paypal-transmission-id"],
        transmission_time: opts.headers["paypal-transmission-time"],
        cert_url:          opts.headers["paypal-cert-url"],
        auth_algo:         opts.headers["paypal-auth-algo"],
        transmission_sig:  opts.headers["paypal-transmission-sig"],
        webhook_id:        opts.webhookId,
        webhook_event:     JSON.parse(opts.body),
      }),
    });
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
