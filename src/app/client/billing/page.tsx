import { verifyClientSession } from "@/lib/dal";
import {
  getActiveSubscription, getBillingPayments, getRefunds,
  getPlans, getPlanChanges, getBillingRenewalHistory, getInvoicesByClient,
} from "@/lib/queries";
import { getActiveProvider } from "@/lib/payments";
import { ClientBillingView } from "./ClientBillingView";

export const metadata = { title: "Billing & Plans — Arashi OPS" };

export default async function ClientBillingPage() {
  const { clientId } = await verifyClientSession();
  const [subscription, payments, refunds, plans, planChanges, renewalHistory, invoices] = await Promise.all([
    getActiveSubscription(clientId),
    getBillingPayments(clientId, 24),
    getRefunds(clientId, 12),
    getPlans(true),
    getPlanChanges(clientId, 10),
    getBillingRenewalHistory(clientId, 10),
    getInvoicesByClient(clientId),
  ]);
  const provider = getActiveProvider();
  return (
    <ClientBillingView
      clientId={clientId}
      subscription={subscription}
      payments={payments}
      refunds={refunds}
      plans={plans}
      planChanges={planChanges}
      renewalHistory={renewalHistory}
      stripeConfigured={provider.isConfigured()}
      activeProvider={provider.isConfigured() ? provider.providerName : undefined}
      invoices={invoices}
    />
  );
}
