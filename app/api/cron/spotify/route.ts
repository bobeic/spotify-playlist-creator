import { NextRequest, NextResponse } from "next/server";
import { syncRecentlyPlayedForConnectedUsers } from "@/lib/spotify/syncRecentlyPlayed";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  if (
    request.headers.get("Authorization") !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.warn("[spotify-cron] Unauthorized cron request");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("[spotify-cron] Cron sync started");
    const summary = await syncRecentlyPlayedForConnectedUsers();
    console.log("[spotify-cron] Cron sync finished", {
      durationMs: Date.now() - startedAt,
      ...summary,
    });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[spotify-cron] Cron sync failed", {
      durationMs: Date.now() - startedAt,
      error,
    });
    return NextResponse.json(
      { error: "Failed to sync Spotify recently played tracks" },
      { status: 500 }
    );
  }
}
