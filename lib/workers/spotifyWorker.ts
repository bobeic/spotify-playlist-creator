import { Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
// import { prisma } from "../prisma";
import { prisma } from "@/lib/prisma";
// import { refreshSpotifyToken } from "../auth/spotify";
import { refreshSpotifyToken } from "@/lib/auth/spotify";

const redisConnection: ConnectionOptions = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
};

export const spotifyWorker = new Worker(
  "spotifyQueue",
  async (job) => {
    try {
      const { userId } = job.data as { userId: string };
      console.log(`🔄 Processing job ${job.id} for user ${userId}`);

      // 1️⃣ Fetch the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { spotifyAccount: true },
      });

      if (!user) {
        console.warn(`⚠️ User not found for ID: ${userId}. Skipping job.`);
        return; // stop processing this job
      }

      if (!user.spotifyAccount) {
        console.warn(`⚠️ User ${userId} has no Spotify account. Skipping job.`);
        return;
      }

      // 2️⃣ Refresh token if expired
      let accessToken = user.spotifyAccount.accessToken;
      if (user.spotifyAccount.expiresAt < new Date()) {
        const tokens = await refreshSpotifyToken(user.spotifyAccount.refreshToken);
        accessToken = tokens.accessToken;

        await prisma.spotifyAccount.update({
          where: { userId: user.id },
          data: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            scope: tokens.scope,
          },
        });
      }

      // 3️⃣ Fetch recently played tracks
      const res = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=50",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(`Spotify API fetch failed for user ${userId}: ${text}`);
        return;
      }

      const data = await res.json();
      const plays = data.items ?? [];

      // 4️⃣ Upsert into PlayHistory
      for (const item of plays) {
        await prisma.playHistory.upsert({
          where: {
            userId_spotifyTrackId_playedAt: {
              userId: user.id,
              spotifyTrackId: item.track.id,
              playedAt: new Date(item.played_at),
            },
          },
          update: {},
          create: {
            userId: user.id,
            spotifyTrackId: item.track.id,
            trackName: item.track.name,
            artistName: item.track.artists.map((a: any) => a.name).join(", "),
            albumName: item.track.album.name,
            albumImage: item.track.album.images?.[0]?.url ?? null,
            playedAt: new Date(item.played_at),
          },
        });
      }

      console.log(`✅ Successfully processed job ${job.id} for user ${userId}`);

    } catch (err) {
      console.error(`❌ Job ${job.id} failed:`, err);
      // we catch all errors to prevent crashing the worker
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

spotifyWorker.on("failed", (job, err) => {
  console.error(`💥 Job ${job?.id} failed:`, err);
});
