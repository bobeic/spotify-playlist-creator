import { NextResponse } from "next/server";
import { enqueueAllUsers } from "@/lib/workers/enqueueAllUsers";

export async function GET() {
  try {
    await enqueueAllUsers();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error enqueuing users:", err);
    return NextResponse.json({ error: "Failed to enqueue users" }, { status: 500 });
  }
}
