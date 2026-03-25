import { prisma } from "@/lib/prisma";
import { refreshSpotifyToken } from "@/lib/auth/spotify";
import type { SpotifyAccount } from "@/app/generated/prisma/client";

export async function getValidSpotifyAccessToken(
  spotifyAccount: SpotifyAccount
): Promise<string> {
  // Token still valid
  if (spotifyAccount.expiresAt > new Date()) {
    return spotifyAccount.accessToken;
  }

  // Refresh token
  const tokens = await refreshSpotifyToken(spotifyAccount.refreshToken);

  await prisma.spotifyAccount.update({
    where: { userId: spotifyAccount.userId },
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
    },
  });

  return tokens.accessToken;
}
