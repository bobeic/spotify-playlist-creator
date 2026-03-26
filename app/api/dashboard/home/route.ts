import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  getLatestPlayHistoryUpdate,
  getListeningMomentum,
  getMiniWrapped,
  getRecentlyPlayed,
  getTopArtistsThisWeek,
  getTopTracksThisWeek,
} from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [
    topTracks,
    topArtists,
    recentPlays,
    latestPlayHistoryUpdate,
    listeningMomentum,
    miniWrapped,
  ] = await Promise.all([
    getTopTracksThisWeek(user.id),
    getTopArtistsThisWeek(user.id),
    getRecentlyPlayed(user.id),
    getLatestPlayHistoryUpdate(user.id),
    getListeningMomentum(user.id),
    getMiniWrapped(user.id),
  ]);

  return NextResponse.json({
    topTracks,
    topArtists,
    recentPlays,
    latestPlayHistoryUpdate,
    listeningMomentum,
    miniWrapped,
    serverRefreshedAt: new Date().toISOString(),
  });
}
