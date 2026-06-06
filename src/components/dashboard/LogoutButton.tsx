"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center gap-2 w-full px-2.5 py-[7px] rounded-md text-[12.5px] text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
      >
        <LogOut size={12} />
        <span>Sign out</span>
      </button>
    </form>
  );
}
