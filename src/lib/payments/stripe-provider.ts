import {
  isStripeConfigured,
  getOrCreateStripeCustomer,
  createCheckoutSession,
  cancelStripeSubscription,
  createStripeRefund,
} from "../stripe";
import type {
  PaymentProvider,
  CreateCustomerInput,
  CreateCheckoutInput,
  CheckoutResult,
} from "./payment-provider";

export class StripeProvider implements PaymentProvider {
  readonly providerName = "stripe";

  isConfigured(): boolean {
    return isStripeConfigured();
  }

  async createCustomer(input: CreateCustomerInput): Promise<string> {
    return getOrCreateStripeCustomer(input.clientId, input.email, input.name);
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    return createCheckoutSession({
      stripeCustomerId: input.providerCustomerId,
      priceId: input.priceId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: input.metadata,
    });
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    return cancelStripeSubscription(providerSubscriptionId);
  }

  async createRefund(chargeId: string, amount: number, reason?: string): Promise<string> {
    return createStripeRefund(chargeId, amount, reason);
  }
}
