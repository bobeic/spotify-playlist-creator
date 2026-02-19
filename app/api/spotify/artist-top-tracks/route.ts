import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/getCurrentUser"

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get("artistId")
  if (!artistId) {
    return NextResponse.json({ error: "Missing artistId" }, { status: 400 })
  }

  // ✅ Get the current logged-in user
  const user = await getCurrentUser()
  if (!user || !user.spotifyAccount) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const accessToken = user.spotifyAccount.accessToken

  // ✅ Fetch top tracks for the artist
  const res = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: 400 })
  }

  return NextResponse.json(data.tracks)
}
