import { verifyOwnerSession } from "@/lib/dal";
import { getPaymentProviders } from "@/lib/queries";
import { ProvidersView } from "./ProvidersView";

export const metadata = { title: "Payment Providers — Arashi OPS" };

export default async function ProvidersPage() {
  await verifyOwnerSession();
  const providers = await getPaymentProviders();

  const envConfig: Record<string, boolean> = {
    stripe:   !!(process.env.STRIPE_SECRET_KEY),
    manual:   true,
    razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    paypal:   !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    wise:     !!(process.env.WISE_API_KEY),
  };

  return <ProvidersView providers={providers} envConfig={envConfig} />;
}
