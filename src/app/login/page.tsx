import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Arashi OPS",
  description: "Sign in to your Arashi OPS platform.",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <LogoMark size="sm" />
          <span className="text-[15px] font-semibold text-[#111111] tracking-tight">
            Arashi OPS
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-8">
          <div className="mb-6">
            <h1 className="text-[22px] font-bold tracking-tight text-[#111111] mb-1">
              Welcome back
            </h1>
            <p className="text-[13.5px] text-[#6b7280]">
              Sign in to your platform account.
            </p>
          </div>

          <LoginFormWrapper searchParams={searchParams} />
        </div>

        <p className="text-center text-[12px] text-[#9ca3af] mt-6">
          No account? Contact your Arashi OPS account manager.
        </p>
      </div>
    </div>
  );
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm next={params.next} />;
}
