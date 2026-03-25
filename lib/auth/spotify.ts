import { prisma } from "@/lib/prisma"

export type SpotifyProfile = {
  id: string
  display_name?: string
  email?: string
  images?: { url: string }[]
}

export type SpotifyTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: Date
  scope?: string
}

export type RefreshedSpotifyTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: Date
  scope?: string | null
}

// 3️⃣ Upsert function
export async function upsertSpotifyUser({
  spotifyProfile,
  tokens,
}: {
  spotifyProfile: SpotifyProfile
  tokens: SpotifyTokens
}) {
  // Upsert the user based on spotifyId
  const user = await prisma.user.upsert({
    where: { spotifyId: spotifyProfile.id },
    update: {
      displayName: spotifyProfile.display_name ?? null,
      email: spotifyProfile.email ?? null,
      imageUrl: spotifyProfile.images?.[0]?.url ?? null,
    },
    create: {
      spotifyId: spotifyProfile.id,
      displayName: spotifyProfile.display_name ?? null,
      email: spotifyProfile.email ?? null,
      imageUrl: spotifyProfile.images?.[0]?.url ?? null,
    },
  })

  // Upsert the Spotify account
  await prisma.spotifyAccount.upsert({
    where: { userId: user.id },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope ?? null,
    },
    create: {
      userId: user.id,
      spotifyId: spotifyProfile.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope ?? null,
    },
  })

  return user
}

export async function refreshSpotifyToken(
  refreshToken: string
): Promise<RefreshedSpotifyTokens> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials")
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("Spotify token refresh failed:", data)
    throw new Error("Failed to refresh Spotify access token")
  }

  return {
    accessToken: data.access_token,
    // Spotify may not return a new refresh token
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope ?? null,
  }
}
