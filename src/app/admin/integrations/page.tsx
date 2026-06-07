import { verifyOwnerSession } from "@/lib/dal";
import {
  getIntegrations, getCredentials, getAllEmailConfigs, getEmailStats,
  getApolloLeadCount, getInstantlyStats, getCrmStats, getSyncStats,
  getWebhooks,
} from "@/lib/queries";
import { IntegrationsView } from "./IntegrationsView";

export const metadata = { title: "Integrations — Arashi OPS" };

export default async function IntegrationsPage() {
  await verifyOwnerSession();
  const [
    integrations, credentials, emailConfigs, emailStats,
    apolloLeadCount, instantlyStats, crmStats, syncStats, webhooks,
  ] = await Promise.all([
    getIntegrations(),
    getCredentials(),
    getAllEmailConfigs(),
    getEmailStats(),
    getApolloLeadCount(),
    getInstantlyStats(),
    getCrmStats(),
    getSyncStats(),
    getWebhooks(),
  ]);

  return (
    <IntegrationsView
      integrations={integrations}
      credentials={credentials}
      emailConfigs={emailConfigs}
      emailStats={emailStats}
      apolloLeadCount={apolloLeadCount}
      instantlyStats={instantlyStats}
      crmStats={crmStats}
      syncStats={syncStats}
      webhooks={webhooks}
    />
  );
}
