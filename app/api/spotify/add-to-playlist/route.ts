import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/getCurrentUser"

export async function POST(req: NextRequest) {
  // 1️⃣ Get the current logged-in user
  const user = await getCurrentUser()
  if (!user || !user.spotifyAccount) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const accessToken = user.spotifyAccount.accessToken

  // 2️⃣ Parse request body
  const { playlistId, trackUris } = await req.json()

  // 3️⃣ Make Spotify API request
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: trackUris }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
