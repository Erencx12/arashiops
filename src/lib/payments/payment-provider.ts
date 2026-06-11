export interface CreateCustomerInput {
  clientId: number;
  email: string;
  name: string;
}

export interface CreateCheckoutInput {
  providerCustomerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface PaymentProvider {
  readonly providerName: string;
  isConfigured(): boolean;
  createCustomer(input: CreateCustomerInput): Promise<string>;
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  createRefund(chargeId: string, amount: number, reason?: string): Promise<string>;
}
