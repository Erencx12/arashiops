import { verifyOwnerSession } from "@/lib/dal";
import {
  getPlans, getSubscriptions, getBillingPayments, getRefunds,
  getBillingMetrics, getUpcomingRenewals, getPlanChanges,
  getBillingRenewalHistory, getClients, getBillingEvents,
} from "@/lib/queries";
import { isStripeConfigured } from "@/lib/stripe";
import { BillingView } from "./BillingView";

export const metadata = { title: "Billing Center — Arashi OPS" };

export default async function BillingPage() {
  await verifyOwnerSession();
  const [plans, subscriptions, payments, refunds, metrics, upcomingRenewals,
         planChanges, renewalHistory, clients, billingEvents] = await Promise.all([
    getPlans(),
    getSubscriptions(),
    getBillingPayments(undefined, 100),
    getRefunds(undefined, 50),
    getBillingMetrics(),
    getUpcomingRenewals(30),
    getPlanChanges(undefined, 50),
    getBillingRenewalHistory(undefined, 50),
    getClients(),
    getBillingEvents(20),
  ]);
  const stripeConfigured = isStripeConfigured();
  return (
    <BillingView
      plans={plans}
      subscriptions={subscriptions}
      payments={payments}
      refunds={refunds}
      metrics={metrics}
      upcomingRenewals={upcomingRenewals}
      planChanges={planChanges}
      renewalHistory={renewalHistory}
      clients={clients}
      billingEvents={billingEvents}
      stripeConfigured={stripeConfigured}
    />
  );
}
