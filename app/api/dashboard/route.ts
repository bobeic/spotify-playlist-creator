import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  getTopTracksThisWeek,
  getTopArtistsThisWeek,
  getNewTracksThisWeek,
  getRecentlyPlayed
} from "@/lib/dashboard/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [topTracks, topArtists, newTracks, recentPlays] = await Promise.all([
    getTopTracksThisWeek(user.id),
    getTopArtistsThisWeek(user.id),
    getNewTracksThisWeek(user.id),
    getRecentlyPlayed(user.id),
  ]);

  return NextResponse.json({
    topTracks,
    topArtists,
    newTracks,
    recentPlays,
  });
}
