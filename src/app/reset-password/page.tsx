import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Arashi OPS",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[380px]">
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 text-center">
            <p className="text-[15px] font-semibold text-[#111111] mb-2">
              Invalid reset link
            </p>
            <p className="text-[13px] text-[#6b7280] mb-5">
              This link is missing a reset token.
            </p>
            <Link
              href="/forgot-password"
              className="text-[13px] text-[#111111] underline underline-offset-2 hover:no-underline"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Set new password
            </h1>
            <p className="text-[13.5px] text-[#6b7280]">
              Choose a strong password for your account.
            </p>
          </div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
