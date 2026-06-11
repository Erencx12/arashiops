import { verifyOwnerSession } from "@/lib/dal";
import { getConfigStatus, getCriticalMissingCount } from "@/lib/config";
import {
  getClients, getSubscriptions, getTestCases, getSops, getDocs,
  getErrorLogs, getLatestHealthChecks, getBillingMetrics, getClientTemplates,
} from "@/lib/queries";
import { LaunchView } from "./LaunchView";

export const metadata = { title: "Launch Center — Arashi OPS" };

export default async function LaunchPage() {
  await verifyOwnerSession();

  const [
    configStatus, healthChecks, clients, subscriptions,
    testCases, sops, docs, errorLogs, billingMetrics, templates,
  ] = await Promise.all([
    Promise.resolve(getConfigStatus()),
    getLatestHealthChecks(),
    getClients(),
    getSubscriptions(),
    getTestCases(),
    getSops(),
    getDocs(),
    getErrorLogs(50, true),
    getBillingMetrics(),
    getClientTemplates(),
  ]);

  const criticalMissing = getCriticalMissingCount();

  return (
    <LaunchView
      configStatus={configStatus}
      criticalMissing={criticalMissing}
      healthChecks={healthChecks}
      clients={clients}
      subscriptions={subscriptions}
      testCases={testCases}
      sops={sops}
      docs={docs}
      unresolvedErrors={errorLogs.length}
      billingMetrics={billingMetrics}
      templates={templates}
    />
  );
}
