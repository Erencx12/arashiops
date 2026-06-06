"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/auth-actions";
import type { ForgotState } from "@/lib/auth-actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(
    forgotPasswordAction,
    null
  );

  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-[#d1fae5] bg-[#f0fdf4] px-4 py-4">
          <p className="text-[13.5px] text-emerald-800 font-medium mb-1">
            Reset link generated
          </p>
          <p className="text-[13px] text-emerald-700 leading-relaxed">
            {state.resetToken
              ? "Copy the link below and share it with the user."
              : "If this email is registered, a reset link has been sent."}
          </p>
        </div>

        {state.resetToken && (
          <div className="rounded-md border border-[#e5e7eb] bg-[#fafafa] p-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">
              Reset link (share manually)
            </p>
            <p className="text-[12px] text-[#374151] font-mono break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/reset-password?token={state.resetToken}
            </p>
          </div>
        )}

        <Link
          href="/login"
          className="block text-center text-[13px] text-[#6b7280] hover:text-[#111111] transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-[12.5px] font-medium text-[#374151]"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#111111]"
        />
        {state?.fieldErrors?.email && (
          <p className="text-[12px] text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#111111] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <Link
        href="/login"
        className="block text-center text-[13px] text-[#6b7280] hover:text-[#111111] transition-colors"
      >
        Back to sign in
      </Link>
    </form>
  );
}
