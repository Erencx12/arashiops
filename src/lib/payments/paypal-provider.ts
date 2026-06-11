import type {
  PaymentProvider,
  CreateCustomerInput,
  CreateCheckoutInput,
  CheckoutResult,
} from "./payment-provider";

export class PayPalProvider implements PaymentProvider {
  readonly providerName = "paypal";

  isConfigured(): boolean {
    return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }

  async createCustomer(_input: CreateCustomerInput): Promise<string> {
    throw new Error("PayPal integration coming soon.");
  }

  async createCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
    throw new Error("PayPal integration coming soon.");
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<void> {
    throw new Error("PayPal integration coming soon.");
  }

  async createRefund(_chargeId: string, _amount: number, _reason?: string): Promise<string> {
    throw new Error("PayPal integration coming soon.");
  }
}
