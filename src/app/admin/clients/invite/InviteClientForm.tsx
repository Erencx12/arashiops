"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createClientUserAction } from "@/lib/auth-actions";
import type { CreateClientState } from "@/lib/auth-actions";

export function InviteClientForm() {
  const [state, action, pending] = useActionState<CreateClientState, FormData>(
    createClientUserAction,
    null
  );

  if (state?.success) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-[#d1fae5] bg-[#f0fdf4] px-5 py-4">
          <p className="text-[13.5px] text-emerald-800 font-semibold mb-1">
            Client account created
          </p>
          <p className="text-[13px] text-emerald-700 leading-relaxed">
            Share the login details below with the client.
          </p>
        </div>

        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#fafafa]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">
              Login credentials (share manually)
            </p>
          </div>
          <div className="divide-y divide-[#f3f4f6]">
            <div className="px-5 py-3.5">
              <p className="text-[11.5px] text-[#9ca3af] mb-0.5">Login URL</p>
              <p className="text-[13px] font-mono text-[#374151]">
                {typeof window !== "undefined" ? window.location.origin : ""}/login
              </p>
            </div>
            <div className="px-5 py-3.5">
              <p className="text-[11.5px] text-[#9ca3af] mb-0.5">Temporary password</p>
              <p className="text-[13px] font-mono font-semibold text-[#111111] tracking-wider">
                {state.tempPassword}
              </p>
            </div>
            <div className="px-5 py-3.5">
              <p className="text-[11.5px] text-[#9ca3af] mb-0.5">Invite token (expires in 7 days)</p>
              <p className="text-[11px] font-mono text-[#6b7280] break-all">
                {state.inviteToken}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[12.5px] text-[#9ca3af]">
          The client can change their password after first login via Forgot Password.
        </p>

        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 max-w-[560px]">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            name="companyName"
            required
            placeholder="Acme Corp"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111]"
          />
          {state?.fieldErrors?.companyName && (
            <p className="text-[12px] text-red-600">{state.fieldErrors.companyName[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">
            Contact name <span className="text-red-500">*</span>
          </label>
          <input
            name="contactName"
            required
            placeholder="Jane Smith"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111]"
          />
          {state?.fieldErrors?.contactName && (
            <p className="text-[12px] text-red-600">{state.fieldErrors.contactName[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-[#374151]">
          Email address <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="jane@company.com"
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111]"
        />
        {state?.fieldErrors?.email && (
          <p className="text-[12px] text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Industry</label>
          <input
            name="industry"
            required
            placeholder="B2B SaaS"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Monthly value ($)</label>
          <input
            name="monthlyValue"
            type="number"
            required
            placeholder="1500"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Tier</label>
          <select
            name="tier"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#374151] outline-none focus:border-[#111111]"
          >
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Status</label>
          <select
            name="status"
            className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#374151] outline-none focus:border-[#111111]"
          >
            <option value="Active">Active</option>
            <option value="Review">Review</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Creating…" : "Create client & send invite"}
        </button>
        <Link
          href="/admin/clients"
          className="px-5 py-2.5 border border-[#e5e7eb] text-[#374151] text-[13px] font-medium rounded-md hover:bg-[#f9fafb] transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
