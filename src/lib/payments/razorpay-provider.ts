import type {
  PaymentProvider,
  CreateCustomerInput,
  CreateCheckoutInput,
  CheckoutResult,
} from "./payment-provider";

export class RazorpayProvider implements PaymentProvider {
  readonly providerName = "razorpay";

  isConfigured(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  async createCustomer(_input: CreateCustomerInput): Promise<string> {
    throw new Error("Razorpay integration coming soon.");
  }

  async createCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
    throw new Error("Razorpay integration coming soon.");
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<void> {
    throw new Error("Razorpay integration coming soon.");
  }

  async createRefund(_chargeId: string, _amount: number, _reason?: string): Promise<string> {
    throw new Error("Razorpay integration coming soon.");
  }
}
