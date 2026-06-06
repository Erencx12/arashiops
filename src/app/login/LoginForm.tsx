"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";
import type { LoginState } from "@/lib/auth-actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null
  );

  return (
    <form action={action} className="space-y-4">
      {/* Hidden next redirect */}
      {next && <input type="hidden" name="next" value={next} />}

      {/* Global error */}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-[12.5px] font-medium text-[#374151]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#111111] focus:ring-0"
        />
        {state?.fieldErrors?.email && (
          <p className="text-[12px] text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-[12.5px] font-medium text-[#374151]"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-md border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-[#111111] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#111111] focus:ring-0"
        />
        {state?.fieldErrors?.password && (
          <p className="text-[12px] text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {/* Remember me */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          name="rememberMe"
          value="1"
          className="w-4 h-4 rounded border-[#d1d5db] text-[#111111] accent-[#111111]"
        />
        <span className="text-[13px] text-[#6b7280]">Remember me for 30 days</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#111111] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
