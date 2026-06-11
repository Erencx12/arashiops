import type {
  PaymentProvider,
  CreateCustomerInput,
  CreateCheckoutInput,
  CheckoutResult,
} from "./payment-provider";

export class ManualProvider implements PaymentProvider {
  readonly providerName = "manual";

  isConfigured(): boolean {
    return true;
  }

  async createCustomer(input: CreateCustomerInput): Promise<string> {
    return `manual-client-${input.clientId}`;
  }

  async createCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
    throw new Error("Manual provider does not support hosted checkout. Use Record Payment instead.");
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<void> {
    // Manual subscriptions are cancelled by updating the DB record only — no remote call needed.
  }

  async createRefund(_chargeId: string, _amount: number, _reason?: string): Promise<string> {
    return `manual-refund-${Date.now()}`;
  }
}
