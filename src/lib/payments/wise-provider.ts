import type {
  PaymentProvider,
  CreateCustomerInput,
  CreateCheckoutInput,
  CheckoutResult,
} from "./payment-provider";

export class WiseProvider implements PaymentProvider {
  readonly providerName = "wise";

  isConfigured(): boolean {
    return !!(process.env.WISE_API_KEY);
  }

  async createCustomer(_input: CreateCustomerInput): Promise<string> {
    throw new Error("Wise integration coming soon.");
  }

  async createCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
    throw new Error("Wise integration coming soon.");
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<void> {
    throw new Error("Wise integration coming soon.");
  }

  async createRefund(_chargeId: string, _amount: number, _reason?: string): Promise<string> {
    throw new Error("Wise integration coming soon.");
  }
}
