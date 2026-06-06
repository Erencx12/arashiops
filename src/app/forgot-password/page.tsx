import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Arashi OPS",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <LogoMark size="sm" />
          <span className="text-[15px] font-semibold text-[#111111] tracking-tight">
            Arashi OPS
          </span>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl p-8">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold tracking-tight text-[#111111] mb-1">
              Reset your password
            </h1>
            <p className="text-[13.5px] text-[#6b7280]">
              Enter your email and we&apos;ll generate a reset link.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
