import { prisma } from "@/lib/prisma";
import { getValidSpotifyAccessToken } from "@/lib/spotify/getValidSpotifyAccessToken";
import type { SpotifyAccount } from "@/app/generated/prisma/client";

type SpotifyRecentlyPlayedResponse = {
  items?: Array<{
    played_at: string;
    track: {
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: {
        name: string | null;
        images?: Array<{ url: string }>;
      };
    };
  }>;
};

export type UserRecentlyPlayedSyncSummary = {
  userId: string;
  fetchedPlays: number;
  insertedPlays: number;
  skippedExistingPlays: number;
  newTracksInserted: number;
};

export async function syncRecentlyPlayedForUser(
  spotifyAccount: SpotifyAccount
): Promise<UserRecentlyPlayedSyncSummary> {
  const accessToken = await getValidSpotifyAccessToken(spotifyAccount);
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=50",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Spotify recently played fetch failed for user ${spotifyAccount.userId}: ${text}`
    );
  }

  const data = (await res.json()) as SpotifyRecentlyPlayedResponse;
  const plays = [...(data.items ?? [])].sort(
    (left, right) =>
      new Date(left.played_at).getTime() - new Date(right.played_at).getTime()
  );
  const incomingTrackIds = [...new Set(plays.map((item) => item.track.id))];
  const knownTracks = new Set(
    (
      await prisma.playHistory.findMany({
        where: {
          userId: spotifyAccount.userId,
          spotifyTrackId: { in: incomingTrackIds },
        },
        select: { spotifyTrackId: true },
        distinct: ["spotifyTrackId"],
      })
    ).map((play) => play.spotifyTrackId)
  );

  const summary: UserRecentlyPlayedSyncSummary = {
    userId: spotifyAccount.userId,
    fetchedPlays: plays.length,
    insertedPlays: 0,
    skippedExistingPlays: 0,
    newTracksInserted: 0,
  };

  for (const item of plays) {
    const playedAt = new Date(item.played_at);
    const existingPlay = await prisma.playHistory.findUnique({
      where: {
        userId_spotifyTrackId_playedAt: {
          userId: spotifyAccount.userId,
          spotifyTrackId: item.track.id,
          playedAt,
        },
      },
    });

    if (existingPlay) {
      summary.skippedExistingPlays += 1;
      continue;
    }

    const isNewTrack = !knownTracks.has(item.track.id);

    await prisma.playHistory.create({
      data: {
        userId: spotifyAccount.userId,
        spotifyTrackId: item.track.id,
        trackName: item.track.name,
        artistName: item.track.artists.map((artist) => artist.name).join(", "),
        albumName: item.track.album.name,
        albumImage: item.track.album.images?.[0]?.url ?? null,
        playedAt,
        isNewTrack,
      },
    });

    knownTracks.add(item.track.id);
    summary.insertedPlays += 1;
    if (isNewTrack) {
      summary.newTracksInserted += 1;
    }
  }

  console.log("[spotify-sync] User sync complete", summary);

  return summary;
}

export async function syncRecentlyPlayedForConnectedUsers() {
  const spotifyAccounts = await prisma.spotifyAccount.findMany();
  const summary = {
    totalUsers: spotifyAccounts.length,
    processedUsers: 0,
    failedUsers: 0,
    insertedTracks: 0,
    newTracksInserted: 0,
    skippedExistingTracks: 0,
  };

  console.log("[spotify-sync] Starting sync for connected users", {
    totalUsers: summary.totalUsers,
  });

  for (const spotifyAccount of spotifyAccounts) {
    try {
      const userSummary = await syncRecentlyPlayedForUser(spotifyAccount);
      summary.processedUsers += 1;
      summary.insertedTracks += userSummary.insertedPlays;
      summary.newTracksInserted += userSummary.newTracksInserted;
      summary.skippedExistingTracks += userSummary.skippedExistingPlays;
    } catch (error) {
      summary.failedUsers += 1;
      console.error(
        `Failed to sync recently played for user ${spotifyAccount.userId}:`,
        error
      );
    }
  }

  console.log("[spotify-sync] Connected user sync complete", summary);

  return summary;
}
