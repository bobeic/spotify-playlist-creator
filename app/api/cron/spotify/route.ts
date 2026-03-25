import { NextRequest, NextResponse } from "next/server";
import { syncRecentlyPlayedForConnectedUsers } from "@/lib/spotify/syncRecentlyPlayed";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("Authorization") !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const summary = await syncRecentlyPlayedForConnectedUsers();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Spotify cron sync failed:", error);
    return NextResponse.json(
      { error: "Failed to sync Spotify recently played tracks" },
      { status: 500 }
    );
  }
}
