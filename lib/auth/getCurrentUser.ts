// lib/auth/getCurrentUser.ts
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { getValidSpotifyAccessToken } from "@/lib/spotify/getValidSpotifyAccessToken"

export type CurrentUser = {
  id: string
  spotifyId: string
  displayName?: string | null
  email?: string | null
  imageUrl?: string | null
  spotifyAccount?: {
    accessToken: string
    refreshToken: string
    expiresAt: Date
    scope?: string | null
  } | null
}

/**
 * Fetch the current user based on sessionId cookie
 * Ensures Spotify access token is valid
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("sessionId")?.value

  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: {
          spotifyAccount: true,
        },
      },
    },
  })

  if (!session) return null
  if (session.expiresAt.getTime() < Date.now()) return null

  const user = session.user

  let spotifyAccount: CurrentUser["spotifyAccount"] = null

  if (user.spotifyAccount) {
    const accessToken = await getValidSpotifyAccessToken(user.spotifyAccount)

    spotifyAccount = {
      accessToken,
      refreshToken: user.spotifyAccount.refreshToken,
      expiresAt: user.spotifyAccount.expiresAt,
      scope: user.spotifyAccount.scope,
    }
  }

  return {
    id: user.id,
    spotifyId: user.spotifyId,
    displayName: user.displayName,
    email: user.email,
    imageUrl: user.imageUrl,
    spotifyAccount,
  }
}
