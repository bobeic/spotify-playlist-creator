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

export async function syncRecentlyPlayedForUser(
  spotifyAccount: SpotifyAccount
): Promise<number> {
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
  const plays = data.items ?? [];
  let insertedCount = 0;

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
      continue;
    }

    await prisma.playHistory.create({
      data: {
        userId: spotifyAccount.userId,
        spotifyTrackId: item.track.id,
        trackName: item.track.name,
        artistName: item.track.artists.map((artist) => artist.name).join(", "),
        albumName: item.track.album.name,
        albumImage: item.track.album.images?.[0]?.url ?? null,
        playedAt,
      },
    });

    insertedCount += 1;
  }

  return insertedCount;
}

export async function syncRecentlyPlayedForConnectedUsers() {
  const spotifyAccounts = await prisma.spotifyAccount.findMany();
  const summary = {
    totalUsers: spotifyAccounts.length,
    processedUsers: 0,
    failedUsers: 0,
    insertedTracks: 0,
  };

  for (const spotifyAccount of spotifyAccounts) {
    try {
      const insertedCount = await syncRecentlyPlayedForUser(spotifyAccount);
      summary.processedUsers += 1;
      summary.insertedTracks += insertedCount;
    } catch (error) {
      summary.failedUsers += 1;
      console.error(
        `Failed to sync recently played for user ${spotifyAccount.userId}:`,
        error
      );
    }
  }

  return summary;
}
