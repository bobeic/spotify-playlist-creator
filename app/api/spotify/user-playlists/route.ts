import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/getCurrentUser"

export async function GET() {
  // ✅ Get the currently logged-in user
  const user = await getCurrentUser()
  if (!user || !user.spotifyAccount) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const accessToken = user.spotifyAccount.accessToken
  const spotifyUserId = user.spotifyId

  // ✅ Fetch user's playlists
  const res = await fetch(
    `https://api.spotify.com/v1/users/${spotifyUserId}/playlists?limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "Spotify error" },
      { status: res.status }
    )
  }

  return NextResponse.json(data.items)
}
