"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Zap, CreditCard, Globe, Building2, FileText } from "lucide-react";
import { setDefaultProviderAction, toggleProviderAction } from "@/lib/provider-actions";
import type { DbPaymentProvider } from "@/lib/db-types";

type Props = {
  providers: DbPaymentProvider[];
  envConfig: Record<string, boolean>;
};

const PROVIDER_META: Record<string, {
  icon: React.ElementType;
  description: string;
  manualNote?: string;
}> = {
  stripe:   { icon: CreditCard, description: "Card payments, recurring billing, hosted checkout" },
  manual:   { icon: FileText,   description: "Bank transfer, wire transfer, cash — no processor required", manualNote: "No API keys needed" },
  razorpay: { icon: Zap,        description: "India-focused payment gateway with UPI, cards, and wallets" },
  paypal:   { icon: Globe,      description: "Global payments via PayPal, Venmo, and Pay Later" },
  wise:     { icon: Building2,  description: "International wire transfers and multi-currency accounts" },
};

export function ProvidersView({ providers, envConfig }: Props) {
  const [, startTransition] = useTransition();

  function handleSetDefault(name: string) {
    startTransition(async () => {
      await setDefaultProviderAction(name);
    });
  }

  function handleToggle(id: number, currentEnabled: boolean) {
    startTransition(async () => {
      await toggleProviderAction(id, !currentEnabled);
    });
  }

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/billing"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[#9ca3af] hover:text-[#6b7280] mb-3">
          <ArrowLeft size={12} /> Back to Billing
        </Link>
        <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">Payment Providers</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">
          Configure which payment processors power your billing. Only one provider is active at a time.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 text-[12.5px] text-blue-700">
        Stripe is the active provider. Other providers are coming soon and will be enabled as integrations are completed.
        Manual Invoice always works — no API keys required.
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Provider</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">API Keys</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Enabled</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Default</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {providers.map((p) => {
              const meta      = PROVIDER_META[p.name];
              const Icon      = meta?.icon ?? CreditCard;
              const isActive  = p.status === "active";
              const apiOk     = envConfig[p.name] ?? false;
              const canEnable = isActive && apiOk;
              const canDefault = p.enabled && apiOk && isActive;

              return (
                <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                  {/* Provider name + description */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-[#374151]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#111111]">{p.display_name}</p>
                        <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{meta?.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f3f4f6] text-[#9ca3af] border border-[#e5e7eb]">
                        Coming Soon
                      </span>
                    )}
                  </td>

                  {/* API Keys */}
                  <td className="px-4 py-4">
                    {meta?.manualNote ? (
                      <span className="text-[12px] text-[#9ca3af]">{meta.manualNote}</span>
                    ) : apiOk ? (
                      <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600">
                        <Check size={12} /> Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-[#9ca3af]">
                        <X size={12} /> Not set
                      </span>
                    )}
                  </td>

                  {/* Enabled toggle */}
                  <td className="px-4 py-4 text-center">
                    {canEnable ? (
                      <button
                        onClick={() => handleToggle(p.id, p.enabled)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                          p.enabled ? "bg-[#111111]" : "bg-[#e5e7eb]"
                        }`}
                        title={p.enabled ? "Disable" : "Enable"}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          p.enabled ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    ) : (
                      <span className="text-[#d1d5db]">—</span>
                    )}
                  </td>

                  {/* Default */}
                  <td className="px-4 py-4 text-center">
                    {p.is_default ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#111111]">
                        <Check size={12} /> Yes
                      </span>
                    ) : canDefault ? (
                      <button
                        onClick={() => handleSetDefault(p.name)}
                        className="text-[12px] text-[#6b7280] hover:text-[#111111] underline underline-offset-2"
                      >
                        Set Default
                      </button>
                    ) : (
                      <span className="text-[#d1d5db]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    {!isActive ? (
                      <span className="text-[11.5px] text-[#d1d5db]">Coming Soon</span>
                    ) : !apiOk && p.name !== "manual" ? (
                      <span className="text-[11.5px] text-[#9ca3af]">Add API keys to enable</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="text-[12px] text-[#9ca3af] mt-4">
        To activate a Coming Soon provider, add the required API keys to your environment variables and contact support.
        Stripe webhooks and existing subscriptions are unaffected by provider changes.
      </p>
    </div>
  );
}
