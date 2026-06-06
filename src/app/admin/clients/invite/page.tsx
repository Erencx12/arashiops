import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { verifyOwnerSession } from "@/lib/dal";
import { InviteClientForm } from "./InviteClientForm";

export const metadata = { title: "Invite Client" };

export default async function InviteClientPage() {
  await verifyOwnerSession();

  return (
    <div className="px-8 py-8">
      <div className="mb-7">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[#9ca3af] hover:text-[#6b7280] transition-colors mb-4"
        >
          <ArrowLeft size={12} />
          Back to clients
        </Link>
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Invite client</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">
          Creates a client record and a portal login account.
        </p>
      </div>

      <InviteClientForm />
    </div>
  );
}
