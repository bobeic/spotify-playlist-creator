import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, trackUris }: { name: string; trackUris: string[] } =
      await req.json();

    if (!name || !trackUris || trackUris.length === 0) {
      return NextResponse.json(
        { error: "Playlist name and tracks required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("spotify_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 1️⃣ Get current user ID
    const meRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();
    const userId = meData.id;

    // 2️⃣ Create playlist
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
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
    );

    const playlistData = await playlistRes.json();
    const playlistId = playlistData.id;

    // 3️⃣ Add tracks to playlist
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
    );

    const addTracksData = await addTracksRes.json();

    return NextResponse.json({
      playlist: playlistData,
      addedTracks: addTracksData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
