import { NextRequest, NextResponse } from "next/server";
import { upsertMeetingFromCal } from "@/lib/queries";
import crypto from "crypto";

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function formatDate(iso: string) {
  return new Date(iso).toISOString().split("T")[0]; // YYYY-MM-DD for Postgres
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers.get("x-cal-signature-256");
    if (!verifySignature(body, sig, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: { triggerEvent: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { triggerEvent, payload } = event;
  const uid = payload.uid as string;

  if (!uid) return NextResponse.json({ ok: true });

  const title = (payload.title as string) ?? "Discovery Call";
  const startTime = payload.startTime as string;
  const durationMins = (payload.duration as number) ?? 45;
  const videoCallData = payload.videoCallData as { url?: string } | undefined;
  const videoUrl = videoCallData?.url ?? null;

  let status: "Upcoming" | "Completed" | "Cancelled" = "Upcoming";
  if (triggerEvent === "BOOKING_CANCELLED" || triggerEvent === "BOOKING_REJECTED") {
    status = "Cancelled";
  }

  try {
    await upsertMeetingFromCal({
      calUid:      uid,
      title,
      meetingDate: formatDate(startTime),
      meetingTime: formatTime(startTime),
      duration:    `${durationMins} mins`,
      status,
      videoUrl,
    });
  } catch (err) {
    console.error("cal webhook db error", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
