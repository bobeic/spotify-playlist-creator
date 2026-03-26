import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  getArtistLoyalty,
  getDiscoveryRate,
  getHeatmapData,
  getNewTracksThisWeek,
} from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [heatmapData, discoveryRate, artistLoyalty, newTracks] = await Promise.all([
    getHeatmapData(user.id),
    getDiscoveryRate(user.id),
    getArtistLoyalty(user.id),
    getNewTracksThisWeek(user.id),
  ]);

  return NextResponse.json({
    heatmapData,
    discoveryRate,
    artistLoyalty,
    newTracks,
    serverRefreshedAt: new Date().toISOString(),
  });
}
