import { prisma } from "@/lib/prisma";

export async function fetchRecentlyPlayedForUser(userId: string) {
  // 1️⃣ Get user's Spotify account tokens
  const account = await prisma.spotifyAccount.findUnique({
    where: { userId },
  });

  if (!account) return;

  const res = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=50`,
    {
      headers: { Authorization: `Bearer ${account.accessToken}` },
    }
  );

  if (!res.ok) {
    console.error("Spotify API error", await res.json());
    return;
  }

  const data = await res.json();

  for (const item of data.items) {
    // 2️⃣ Check if already in DB to prevent duplicates
    const exists = await prisma.playHistory.findUnique({
      where: {
        userId_spotifyTrackId_playedAt: {
          userId,
          spotifyTrackId: item.track.id,
          playedAt: new Date(item.played_at),
        },
      },
    });

    if (exists) continue;

    // 3️⃣ Save to DB
    await prisma.playHistory.create({
      data: {
        userId,
        spotifyTrackId: item.track.id,
        trackName: item.track.name,
        artistName: item.track.artists.map((a: any) => a.name).join(", "),
        albumName: item.track.album.name,
        albumImage: item.track.album.images?.[0]?.url ?? null,
        playedAt: new Date(item.played_at),
        isNewTrack: true, // optional, can calculate later
      },
    });
  }
}
