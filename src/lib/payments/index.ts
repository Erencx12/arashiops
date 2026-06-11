import { StripeProvider }   from "./stripe-provider";
import { ManualProvider }   from "./manual-provider";
import { RazorpayProvider } from "./razorpay-provider";
import { PayPalProvider }   from "./paypal-provider";
import { WiseProvider }     from "./wise-provider";
import type { PaymentProvider } from "./payment-provider";

export type { PaymentProvider };
export * from "./payment-provider";

const _stripe   = new StripeProvider();
const _manual   = new ManualProvider();
const _razorpay = new RazorpayProvider();
const _paypal   = new PayPalProvider();
const _wise     = new WiseProvider();

const REGISTRY: Record<string, PaymentProvider> = {
  stripe:   _stripe,
  manual:   _manual,
  razorpay: _razorpay,
  paypal:   _paypal,
  wise:     _wise,
};

export function getProvider(name: string): PaymentProvider {
  return REGISTRY[name] ?? _stripe;
}

export function getActiveProvider(): PaymentProvider {
  if (_stripe.isConfigured()) return _stripe;
  return _manual;
}

export function getAllProviderMeta(): Array<{
  name: string;
  displayName: string;
  configured: boolean;
}> {
  return [
    { name: "stripe",   displayName: "Stripe",         configured: _stripe.isConfigured()   },
    { name: "manual",   displayName: "Manual Invoice",  configured: _manual.isConfigured()   },
    { name: "razorpay", displayName: "Razorpay",        configured: _razorpay.isConfigured() },
    { name: "paypal",   displayName: "PayPal",          configured: _paypal.isConfigured()   },
    { name: "wise",     displayName: "Wise",            configured: _wise.isConfigured()     },
  ];
}
