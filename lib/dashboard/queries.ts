import { prisma } from "@/lib/prisma";
import { startOfWeek } from "date-fns";

// Top tracks this week
export async function getTopTracksThisWeek(userId: string) {
  return prisma.playHistory.groupBy({
    by: ["spotifyTrackId", "trackName", "artistName", "albumName", "albumImage"],
    where: { userId, playedAt: { gte: startOfWeek(new Date()) } },
    _count: { spotifyTrackId: true },
    orderBy: { _count: { spotifyTrackId: "desc" } },
    take: 5,
  });
}

// Top artists this week
export async function getTopArtistsThisWeek(userId: string) {
  return prisma.playHistory.groupBy({
    by: ["artistName"],
    where: { userId, playedAt: { gte: startOfWeek(new Date()) } },
    _count: { artistName: true },
    orderBy: { _count: { artistName: "desc" } },
    take: 5,
  });
}

// New tracks this week
export async function getNewTracksThisWeek(userId: string) {
  return prisma.playHistory.findMany({
    where: { userId, isNewTrack: true, playedAt: { gte: startOfWeek(new Date()) } },
    orderBy: { playedAt: "desc" },
    take: 5,
  });
}

// Recently played
export async function getRecentlyPlayed(userId: string) {
  return prisma.playHistory.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: 10,
  });
}
