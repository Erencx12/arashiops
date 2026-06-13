"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteMeetingAction } from "./actions";

export function DeleteMeetingButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setPending(true);
    await deleteMeetingAction(id);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      onBlur={() => setConfirming(false)}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
        confirming
          ? "bg-red-50 text-red-600 border border-red-200"
          : "text-[#9ca3af] hover:text-red-500 hover:bg-red-50"
      }`}
    >
      <Trash2 size={11} />
      {confirming ? "Confirm?" : "Delete"}
    </button>
  );
}
