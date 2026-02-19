import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/getCurrentUser"

export async function POST(req: NextRequest) {
  try {
    const { name, trackUris }: { name: string; trackUris: string[] } =
      await req.json()

    if (!name || !trackUris || trackUris.length === 0) {
      return NextResponse.json(
        { error: "Playlist name and tracks required" },
        { status: 400 }
      )
    }

    // ✅ Get current logged-in user and Spotify account
    const user = await getCurrentUser()
    if (!user || !user.spotifyAccount) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const accessToken = user.spotifyAccount.accessToken
    const spotifyUserId = user.spotifyId // Already stored in DB

    // ✅ Create playlist
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: "Created with my Next.js Spotify app",
          public: false,
        }),
      }
    )

    const playlistData = await playlistRes.json()
    if (!playlistRes.ok) {
      return NextResponse.json(playlistData, { status: 400 })
    }

    const playlistId = playlistData.id

    // ✅ Add tracks to the playlist
    const addTracksRes = await fetch(
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

    const addTracksData = await addTracksRes.json()
    if (!addTracksRes.ok) {
      return NextResponse.json(addTracksData, { status: 400 })
    }

    return NextResponse.json({
      playlist: playlistData,
      addedTracks: addTracksData,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
