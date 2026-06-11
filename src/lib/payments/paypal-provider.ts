import type {
  PaymentProvider,
  CreateCustomerInput,
  CreateCheckoutInput,
  CheckoutResult,
} from "./payment-provider";
import {
  isPayPalConfigured,
  createPayPalSubscription,
  cancelPayPalSubscription,
  refundPayPalCapture,
} from "../paypal";

export class PayPalProvider implements PaymentProvider {
  readonly providerName = "paypal";

  isConfigured(): boolean {
    return isPayPalConfigured();
  }

  async createCustomer(input: CreateCustomerInput): Promise<string> {
    // PayPal handles customers during checkout — return email as reference
    return input.email;
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const { subscriptionId, approvalUrl } = await createPayPalSubscription({
      paypalPlanId:    input.priceId,
      customId:        JSON.stringify(input.metadata ?? {}),
      subscriberEmail: input.providerCustomerId, // email from createCustomer
      returnUrl:       input.successUrl,
      cancelUrl:       input.cancelUrl,
    });
    return { sessionId: subscriptionId, url: approvalUrl };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    return cancelPayPalSubscription(providerSubscriptionId);
  }

  async createRefund(captureId: string, amount: number): Promise<string> {
    return refundPayPalCapture(captureId, amount);
  }
}
