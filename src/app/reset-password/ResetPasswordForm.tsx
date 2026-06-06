"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/auth-actions";
import type { ResetState } from "@/lib/auth-actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    resetPasswordAction,
    null
  );

  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-[#d1fae5] bg-[#f0fdf4] px-4 py-4">
          <p className="text-[13.5px] text-emerald-800 font-medium mb-1">
            Password updated
          </p>
          <p className="text-[13px] text-emerald-700">
            Your password has been reset successfully.
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full text-center rounded-md bg-[#111111] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1a1a1a]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-[12.5px] font-medium text-[#374151]"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#111111]"
        />
        {state?.fieldErrors?.password && (
          <p className="text-[12px] text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm"
          className="block text-[12.5px] font-medium text-[#374151]"
        >
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Repeat your password"
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#111111]"
        />
        {state?.fieldErrors?.confirm && (
          <p className="text-[12px] text-red-600">{state.fieldErrors.confirm[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#111111] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Updating…" : "Update password"}
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
